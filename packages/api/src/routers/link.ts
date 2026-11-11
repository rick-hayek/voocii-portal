import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const linkRouter = router({
  /** List active links for public display */
  list: publicProcedure.query(async ({ ctx }) => {
    const fetchList = async () => {
      return ctx.prisma.link.findMany({
        where: { isAlive: true, status: 'approved', NOT: { id: 'site-self-link' } },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(fetchList, ['link-list'], {
        tags: ['links'],
        revalidate: 3600,
      });
      return (await getCached()) as Awaited<ReturnType<typeof fetchList>>;
    }
    return fetchList();
  }),

  /** Get site's self link info */
  getSelf: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.link.findUnique({
      where: { id: 'site-self-link' },
    });
  }),

  /** Public link application with IP rate-limiting, deduplication, and anti-bot protection */
  applyLink: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, 'Name is required')
          .max(50, 'Name cannot exceed 50 characters'),
        url: z
          .string()
          .trim()
          .url('Invalid URL format')
          .max(255, 'URL cannot exceed 255 characters')
          .refine((val) => /^https?:\/\//i.test(val), 'URL must start with http:// or https://'),
        avatar: z
          .string()
          .trim()
          .max(255)
          .url('Invalid Avatar URL format')
          .refine(
            (val) => /^https?:\/\//i.test(val),
            'Avatar URL must start with http:// or https://',
          )
          .optional()
          .or(z.literal('')),
        description: z
          .string()
          .trim()
          .min(1, 'Description is required')
          .max(1000, 'Description cannot exceed 1000 characters'),
        category: z.string().trim().max(50).default('friend'),
        rss: z
          .string()
          .trim()
          .max(255)
          .url('Invalid RSS URL format')
          .refine((val) => /^https?:\/\//i.test(val), 'RSS URL must start with http:// or https://')
          .optional()
          .or(z.literal('')),
        screenshot: z
          .string()
          .trim()
          .max(255)
          .url('Invalid Screenshot URL format')
          .refine(
            (val) => /^https?:\/\//i.test(val),
            'Screenshot URL must start with http:// or https://',
          )
          .optional()
          .or(z.literal('')),
        email: z
          .string()
          .trim()
          .email('Invalid email address')
          .max(100)
          .optional()
          .or(z.literal('')),
        locale: z.string().optional(),
        // Anti-bot safeguards
        captchaAnswer: z.number().optional(),
        captchaExpected: z.number().optional(),
        honeypot: z.string().optional(),
        timingToken: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Math captcha check
      if (
        typeof input.captchaExpected === 'number' &&
        input.captchaAnswer !== input.captchaExpected
      ) {
        return {
          success: false as const,
          error: 'INVALID_CAPTCHA' as const,
        };
      }

      // 2. Anti-bot honeypot check: If hidden honeypot has value, drop silently or reject
      if (input.honeypot && input.honeypot.trim().length > 0) {
        return {
          success: false as const,
          error: 'BOT_DETECTED' as const,
        };
      }

      // 3. Timing check: Human filling form takes at least 1.2s
      if (input.timingToken) {
        const elapsed = Date.now() - input.timingToken;
        if (elapsed < 1200) {
          return {
            success: false as const,
            error: 'SUBMISSION_TOO_FAST' as const,
          };
        }
      }

      const clientIp = ctx.clientIp || '127.0.0.1';

      // 4. IP Rate Limiting: Max 5 submissions per calendar day
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const submissionsToday = await ctx.prisma.link.count({
        where: {
          submitterIp: clientIp,
          createdAt: { gte: todayStart },
        },
      });

      if (submissionsToday >= 5) {
        return {
          success: false as const,
          error: 'RATE_LIMIT_EXCEEDED' as const,
        };
      }

      // 4. Same IP, same day, same name check:
      const existingSameName = await ctx.prisma.link.findFirst({
        where: {
          submitterIp: clientIp,
          name: input.name,
          createdAt: { gte: todayStart },
        },
        orderBy: { createdAt: 'desc' },
      });

      const cleanData = {
        name: input.name,
        url: input.url,
        avatar: input.avatar ? input.avatar : null,
        description: input.description,
        category: input.category || 'friend',
        rss: input.rss ? input.rss : null,
        screenshot: input.screenshot ? input.screenshot : null,
        email: input.email ? input.email : null,
        locale: input.locale || 'zh',
        status: 'pending',
        submitterIp: clientIp,
      };

      if (existingSameName) {
        if (existingSameName.status === 'pending') {
          // If existing is pending -> overwrite/update record
          const updated = await ctx.prisma.link.update({
            where: { id: existingSameName.id },
            data: {
              ...cleanData,
              updatedAt: new Date(),
            },
          });
          return { success: true, action: 'updated', id: updated.id };
        }
        // If existing is approved -> create a new pending entry for admin manual review
      }

      const created = await ctx.prisma.link.create({
        data: {
          ...cleanData,
          isAlive: true,
        },
      });

      return { success: true, action: 'created', id: created.id };
    }),
});
