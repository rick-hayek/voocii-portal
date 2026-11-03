import { getYearMonthInTimeZone } from '@portal/shared';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { fetchCommentTree } from '../utils/comment-tree';

export const postRouter = router({
  /** Paginated post list with optional category/tag/month/UTC range filters */
  list: publicProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(50).default(10),
          categorySlug: z.string().optional(),
          tagSlug: z.string().optional(),
          month: z
            .string()
            .regex(/^\d{4}-\d{2}$/)
            .optional(),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
          status: z.enum(['draft', 'published']).default('published'),
        })
        .default({ page: 1, limit: 10, status: 'published' as const }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, categorySlug, tagSlug, month, startDate, endDate, status } = input;
      const skip = (page - 1) * limit;

      let dateFilter: { gte?: Date; lt?: Date } | undefined;
      if (startDate && endDate) {
        dateFilter = { gte: new Date(startDate), lt: new Date(endDate) };
      } else if (month) {
        const parts = month.split('-');
        if (parts.length === 2 && parts[0] && parts[1]) {
          const yr = parseInt(parts[0], 10);
          const mo = parseInt(parts[1], 10);
          if (!Number.isNaN(yr) && !Number.isNaN(mo) && mo >= 1 && mo <= 12) {
            const s = new Date(Date.UTC(yr, mo - 1, 1));
            const e = new Date(Date.UTC(yr, mo, 1));
            dateFilter = { gte: s, lt: e };
          }
        }
      }

      const where = {
        status,
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
        ...(dateFilter && { publishedAt: dateFilter }),
      };

      const fetchQuery = async () => {
        const [posts, total] = await Promise.all([
          ctx.prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
              author: { select: { id: true, name: true, image: true } },
              category: { select: { id: true, name: true, name_en: true, slug: true } },
              tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
            },
          }),
          ctx.prisma.post.count({ where }),
        ]);
        return { posts, total };
      };

      let result: Awaited<ReturnType<typeof fetchQuery>>;
      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(
          async (
            _p: number,
            _l: number,
            _cSlug?: string,
            _tSlug?: string,
            _st?: string,
            _m?: string,
            _start?: string,
            _end?: string,
          ) => {
            return fetchQuery();
          },
          ['post-list'],
          { tags: ['posts'], revalidate: 3600 },
        );
        result = (await getCached(
          page,
          limit,
          categorySlug,
          tagSlug,
          status,
          month,
          startDate,
          endDate,
        )) as Awaited<ReturnType<typeof fetchQuery>>;
      } else {
        result = await fetchQuery();
      }

      return {
        posts: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    }),

  /** List all distinct months with published post counts */
  archives: publicProcedure
    .input(z.object({ timeZone: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const targetTz = input?.timeZone || 'UTC';

      const fetchArchives = async (tz: string) => {
        const posts = await ctx.prisma.post.findMany({
          where: { status: 'published', publishedAt: { not: null } },
          select: { publishedAt: true },
          orderBy: { publishedAt: 'desc' },
        });

        const countsMap = new Map<
          string,
          { year: number; month: number; key: string; count: number }
        >();

        for (const post of posts) {
          if (!post.publishedAt) continue;
          const { year, month, key: isoKey } = getYearMonthInTimeZone(post.publishedAt, tz);

          const existing = countsMap.get(isoKey);
          if (existing) {
            existing.count += 1;
          } else {
            countsMap.set(isoKey, { year, month, key: isoKey, count: 1 });
          }
        }

        return Array.from(countsMap.values());
      };

      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(
          async (tz: string) => fetchArchives(tz),
          ['post-archives'],
          {
            tags: ['posts'],
            revalidate: 3600,
          },
        );
        return (await getCached(targetTz)) as Awaited<ReturnType<typeof fetchArchives>>;
      }
      return fetchArchives(targetTz);
    }),

  /** Get a single post by slug */
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const fetchPost = async (s: string) => {
      const post = await ctx.prisma.post.findUnique({
        where: { slug: s, status: 'published' },
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true, name_en: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      });

      if (!post) return null;

      const commentsWithAvatars = await fetchCommentTree(ctx.prisma, post.id, ctx.siteConfig);

      return {
        ...post,
        comments: commentsWithAvatars,
      };
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(fetchPost, ['post-by-slug'], {
        tags: ['posts'],
        revalidate: 3600,
      });
      return (await getCached(input.slug)) as Awaited<ReturnType<typeof fetchPost>>;
    }
    return fetchPost(input.slug);
  }),

  /** Get N most recent published posts (for homepage) */
  recent: publicProcedure
    .input(z.object({ count: z.number().int().min(1).max(20).default(5) }).default({ count: 5 }))
    .query(async ({ ctx, input }) => {
      const fetchRecent = async (c: number) => {
        return ctx.prisma.post.findMany({
          where: { status: 'published' },
          take: c,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, image: true } },
            category: { select: { id: true, name: true, name_en: true, slug: true } },
          },
        });
      };

      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(fetchRecent, ['post-recent'], {
          tags: ['posts'],
          revalidate: 3600,
        });
        return (await getCached(input.count)) as Awaited<ReturnType<typeof fetchRecent>>;
      }
      return fetchRecent(input.count);
    }),
});
