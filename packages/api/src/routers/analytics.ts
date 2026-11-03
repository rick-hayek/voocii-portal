import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const KEY_PAGE_PATHS = [
  '/',
  '/blog',
  '/links',
  '/portfolio',
  '/trending',
  '/books',
  '/tools',
  '/about',
] as const;

export type KeyPagePath = (typeof KEY_PAGE_PATHS)[number];

export interface ArchivedPageViews {
  total: number;
  lastCleanedAt?: string;
  paths: Record<string, number>;
}

/**
 * Normalizes a raw request path (including localized prefixes) to a canonical key page route.
 */
export function normalizeKeyPath(rawPath: string): KeyPagePath | null {
  if (!rawPath) return null;
  const clean = (rawPath.split('?')[0] ?? '').split('#')[0]?.trim() ?? '';
  const withoutLocale = clean.replace(/^\/(?:zh|en)(?=\/|$)/, '') || '/';

  if (withoutLocale === '' || withoutLocale === '/') return '/';
  if (withoutLocale === '/blog') return '/blog';
  if (withoutLocale === '/links' || withoutLocale.startsWith('/links')) return '/links';
  if (withoutLocale === '/portfolio') return '/portfolio';
  if (withoutLocale === '/trending') return '/trending';
  if (withoutLocale === '/books') return '/books';
  if (withoutLocale === '/tools') return '/tools';
  if (withoutLocale === '/about') return '/about';

  return null;
}

export const analyticsRouter = router({
  /** Record page views in batches (public, fire-and-forget) */
  track: publicProcedure
    .input(
      z.array(
        z.object({
          path: z.string().min(1).max(500),
          referrer: z.string().max(1000).optional(),
          userAgent: z.string().max(500).optional(),
          createdAt: z.string().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0) return { ok: true };

      await ctx.prisma.pageView.createMany({
        data: input.map((item) => ({
          path: item.path,
          referrer: item.referrer,
          userAgent: item.userAgent,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        })),
      });

      // Extract blog post slugs and increment Post.views
      const blogSlugs: string[] = [];
      for (const item of input) {
        const match = item.path.match(/^(?:\/(?:zh|en))?\/blog\/([a-zA-Z0-9_-]+)/);
        if (match?.[1]) {
          blogSlugs.push(match[1]);
        }
      }

      if (blogSlugs.length > 0) {
        const counts: Record<string, number> = {};
        for (const slug of blogSlugs) {
          counts[slug] = (counts[slug] || 0) + 1;
        }

        // Use raw SQL to increment views without triggering Prisma's @updatedAt timestamp
        await Promise.allSettled(
          Object.entries(counts).map(
            ([slug, count]) =>
              ctx.prisma.$executeRaw`
                UPDATE "Post"
                SET "views" = "views" + ${count}
                WHERE "slug" = ${slug}
              `,
          ),
        );
      }

      return { ok: true };
    }),

  /** Page view summary — admin only with baseline archive aggregation */
  summary: adminProcedure
    .input(
      z
        .object({
          days: z.number().int().min(1).max(365).default(30),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      // 1. Fetch archived baseline data from SiteConfig
      const archivedConfig = await ctx.prisma.siteConfig.findUnique({
        where: { key: 'archived_page_views' },
      });

      let archived: ArchivedPageViews = { total: 0, paths: {} };
      if (archivedConfig?.value && typeof archivedConfig.value === 'object' && !Array.isArray(archivedConfig.value)) {
        archived = archivedConfig.value as unknown as ArchivedPageViews;
      }
      if (!archived.paths) archived.paths = {};

      // 2. Fetch live metrics
      const [liveTotal, recentViews, topPages, viewsByDay, livePathCounts] = await Promise.all([
        ctx.prisma.pageView.count(),
        ctx.prisma.pageView.count({ where: { createdAt: { gte: since } } }),
        ctx.prisma.$queryRaw`
          SELECT path, COUNT(*)::int AS views
          FROM "PageView"
          WHERE "createdAt" >= ${since}
          GROUP BY path
          ORDER BY views DESC
          LIMIT 10
        ` as Promise<{ path: string; views: number }[]>,
        ctx.prisma.$queryRaw`
          SELECT DATE("createdAt") AS date, COUNT(*)::int AS views
          FROM "PageView"
          WHERE "createdAt" >= ${since}
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        ` as Promise<{ date: string; views: number }[]>,
        ctx.prisma.$queryRaw`
          SELECT path, COUNT(*)::int AS views
          FROM "PageView"
          GROUP BY path
        ` as Promise<{ path: string; views: number }[]>,
      ]);

      // 3. Compute total views & key page views (live + archived)
      const totalViews = liveTotal + (archived.total || 0);

      const keyPageViews: Record<string, number> = {};
      for (const keyPath of KEY_PAGE_PATHS) {
        keyPageViews[keyPath] = archived.paths[keyPath] || 0;
      }

      for (const row of livePathCounts) {
        const norm = normalizeKeyPath(row.path);
        if (norm) {
          keyPageViews[norm] = (keyPageViews[norm] || 0) + row.views;
        }
      }

      return {
        totalViews,
        recentViews,
        days,
        topPages,
        viewsByDay,
        keyPageViews,
        archivedSummary: archived,
      };
    }),

  /** Safe retention cleanup — archives baseline totals before pruning expired PageViews */
  cleanup: adminProcedure
    .input(
      z
        .object({
          daysToKeep: z.number().int().min(30).max(365).default(90),
        })
        .default({ daysToKeep: 90 }),
    )
    .mutation(async ({ ctx, input }) => {
      const daysToKeep = input.daysToKeep;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);

      // 1. Fetch current archived baseline
      const archivedConfig = await ctx.prisma.siteConfig.findUnique({
        where: { key: 'archived_page_views' },
      });

      let archived: ArchivedPageViews = { total: 0, paths: {} };
      if (archivedConfig?.value && typeof archivedConfig.value === 'object' && !Array.isArray(archivedConfig.value)) {
        archived = archivedConfig.value as unknown as ArchivedPageViews;
      }
      if (!archived.paths) archived.paths = {};

      // 2. Count expired rows and aggregate by path
      const [expiredTotal, expiredRows] = await Promise.all([
        ctx.prisma.pageView.count({ where: { createdAt: { lt: cutoff } } }),
        ctx.prisma.$queryRaw`
          SELECT path, COUNT(*)::int AS count
          FROM "PageView"
          WHERE "createdAt" < ${cutoff}
          GROUP BY path
        ` as Promise<{ path: string; count: number }[]>,
      ]);

      if (expiredTotal > 0) {
        archived.total = (archived.total || 0) + expiredTotal;
        archived.lastCleanedAt = new Date().toISOString();

        for (const row of expiredRows) {
          const norm = normalizeKeyPath(row.path);
          if (norm) {
            archived.paths[norm] = (archived.paths[norm] || 0) + row.count;
          }
        }

        // 3. Atomically upsert baseline data in SiteConfig
        await ctx.prisma.siteConfig.upsert({
          where: { key: 'archived_page_views' },
          create: {
            key: 'archived_page_views',
            value: archived as any,
          },
          update: {
            value: archived as any,
          },
        });

        // 4. Safely purge expired raw rows
        await ctx.prisma.pageView.deleteMany({
          where: { createdAt: { lt: cutoff } },
        });
      }

      return {
        success: true,
        deletedCount: expiredTotal,
        retainedDays: daysToKeep,
        cutoffDate: cutoff.toISOString(),
        archivedSummary: archived,
      };
    }),
});
