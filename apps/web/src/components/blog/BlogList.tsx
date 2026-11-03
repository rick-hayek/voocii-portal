'use client';

import { Calendar, ChevronDown, ChevronRight, Filter, Folder, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getLocalMonthUtcRange } from '@portal/shared';
import { PostCard } from '@/components/blog/PostCard';
import { useLocalSWR } from '@/hooks/useLocalSWR';
import { Link } from '@/i18n/routing';
import { getCategoryName } from '@/lib/category';

interface Category {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  _count: {
    posts: number;
  };
}

interface ArchiveItem {
  year: number;
  month: number;
  key: string;
  count: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  authorId: string;
  categoryId: string;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: {
    id: string;
    name: string;
    name_en?: string | null;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface BlogData {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function formatMonthLabel(year: number, month: number, locale: string) {
  if (locale === 'zh') {
    return `${year}年${month}月`;
  }
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function BlogList() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const month = searchParams.get('month') || undefined;

  const clientTz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;

  const { startDate, endDate } = useMemo(() => {
    if (!month) return { startDate: undefined, endDate: undefined };
    const parts = month.split('-');
    const y = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    if (!y || !m || m < 1 || m > 12) return { startDate: undefined, endDate: undefined };
    return getLocalMonthUtcRange(y, m);
  }, [month]);

  const [mobileMonthOpen, setMobileMonthOpen] = useState(false);
  const [collapsedYears, setCollapsedYears] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Blog posts
  const { data: blogData, loading: loadingPosts } = useLocalSWR<BlogData>(
    `blog-posts-page-${page}-cat-${category || 'all'}-tag-${tag || 'all'}-start-${startDate || 'all'}-end-${endDate || 'all'}`,
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/post.list?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': {
                json: {
                  page,
                  limit: 20,
                  categorySlug: category,
                  tagSlug: tag,
                  startDate,
                  endDate,
                },
              },
            }),
          ),
      );
      const json = await res.json();
      return json[0]?.result?.data?.json as BlogData;
    }, [page, category, tag, startDate, endDate]),
  );

  // 2. Fetch categories
  const { data: categoriesData, mutate: mutateCategories } = useLocalSWR<Category[]>(
    'blog-categories',
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/category.list?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const json = await res.json();
      return (json[0]?.result?.data?.json ?? []) as Category[];
    }, []),
  );

  // 3. Fetch monthly archives
  const { data: archivesData } = useLocalSWR<ArchiveItem[]>(
    `blog-archives-tz-${clientTz || 'utc'}`,
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/post.archives?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': {
                json: clientTz ? { timeZone: clientTz } : null,
              },
            }),
          ),
      );
      const json = await res.json();
      return (json[0]?.result?.data?.json ?? []) as ArchiveItem[];
    }, [clientTz]),
  );

  useEffect(() => {
    mutateCategories();
  }, [page, category, tag, month, mutateCategories]);

  const posts = blogData?.posts ?? [];
  const pagination = blogData?.pagination ?? { totalPages: 1 };
  const categories = (categoriesData ?? []).filter((c) => (c._count?.posts ?? 0) > 0);
  const archives = archivesData ?? [];

  // Group archives by year
  const archivesByYear = archives.reduce<Record<number, ArchiveItem[]>>((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {});

  const years = Object.keys(archivesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Helper to build URL with query params
  const getFilterUrl = (opts: { cat?: string | null; mo?: string | null; pg?: number }) => {
    const nextCat = opts.cat !== undefined ? opts.cat : category;
    const nextMo = opts.mo !== undefined ? opts.mo : month;
    const nextPg = opts.pg !== undefined ? opts.pg : 1;

    const params = new URLSearchParams();
    if (nextPg > 1) params.set('page', String(nextPg));
    if (nextCat) params.set('category', nextCat);
    if (tag) params.set('tag', tag);
    if (nextMo) params.set('month', nextMo);

    const str = params.toString();
    return str ? `/blog?${str}` : '/blog';
  };

  const currentCategoryObj = categories.find((c) => c.slug === category);
  const currentMonthItem = archives.find((a) => a.key === month);

  const toggleYearCollapse = (y: number) => {
    setCollapsedYears((prev) => ({ ...prev, [y]: !prev[y] }));
  };

  return (
    <div className="pt-8 md:pt-16 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-[1536px]">
      {/* Symmetrical 3-Column Layout: Left Balance Spacer + Centered Main List + Right Sidebar */}
      <div className="flex justify-center items-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
        {/* Left Empty Balance Spacer (Desktop ≥ 1250px) */}
        <div
          className="hidden min-[1250px]:block shrink w-[200px] xl:w-[240px] 2xl:w-[280px] min-w-[180px] max-w-[280px]"
          aria-hidden="true"
        />

        {/* Main Post List Column */}
        <div className="w-full max-w-3xl shrink min-w-0">
          {/* Section header */}
          <div className="flex items-baseline mb-6 md:mb-8" style={{ gap: '.8rem' }}>
            <span
              style={{
                width: 28,
                height: 2,
                background: 'var(--portal-color-primary)',
                flexShrink: 0,
              }}
            ></span>
            <span
              className="font-mono uppercase text-[var(--portal-color-primary)]"
              style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
            >
              {t('latestPosts')}
            </span>
            <h1
              className="text-[var(--portal-color-text)]"
              style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
            >
              {t('title')}
            </h1>
          </div>

          {/* Mobile Top Filter Bar (Visible on < lg screens) */}
          <div className="lg:hidden mb-6">
            <div
              className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {/* Month Dropdown Button for Mobile */}
              <button
                type="button"
                onClick={() => setMobileMonthOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border shrink-0 transition-colors ${
                  month
                    ? 'bg-[var(--portal-color-primary)] text-white border-transparent'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border-[var(--portal-color-border)] hover:border-[var(--portal-color-primary)]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {currentMonthItem
                    ? formatMonthLabel(currentMonthItem.year, currentMonthItem.month, locale)
                    : month
                      ? (() => {
                          const parts = month.split('-');
                          const y = parseInt(parts[0] || '0', 10);
                          const m = parseInt(parts[1] || '0', 10);
                          return y && m ? formatMonthLabel(y, m, locale) : month;
                        })()
                      : t('allMonths')}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Horizontal Category Pills on Mobile */}
              <Link
                href={getFilterUrl({ cat: null })}
                className={`rounded-full shrink-0 px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  !category
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                }`}
              >
                {t('all')}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={getFilterUrl({ cat: cat.slug })}
                  className={`rounded-full shrink-0 px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    category === cat.slug
                      ? 'bg-[var(--portal-color-primary)] text-white'
                      : 'border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                  }`}
                >
                  {getCategoryName(cat, locale)} ({cat._count.posts})
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Month Modal Sheet */}
          {mobileMonthOpen &&
            mounted &&
            createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="absolute inset-0" onClick={() => setMobileMonthOpen(false)} />
                <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 shadow-2xl max-h-[80vh] flex flex-col my-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--portal-color-border)] mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--portal-color-text)]">
                      <Calendar className="h-4 w-4 text-[var(--portal-color-primary)]" />
                      <span>{t('selectMonth')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMonthOpen(false)}
                      className="rounded-full p-1 text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                    <Link
                      href={getFilterUrl({ mo: null })}
                      onClick={() => setMobileMonthOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        !month
                          ? 'bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] font-semibold'
                          : 'text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                      }`}
                    >
                      <span>{t('allMonths')}</span>
                    </Link>
                    {years.map((y) => (
                      <div key={y} className="pt-2 border-t border-[var(--portal-color-border)]/60">
                        <div className="px-2 py-1 text-xs font-mono font-bold text-[var(--portal-color-text-secondary)]">
                          {y}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 mt-1">
                          {archivesByYear[y].map((item) => (
                            <Link
                              key={item.key}
                              href={getFilterUrl({ mo: item.key })}
                              onClick={() => setMobileMonthOpen(false)}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                                month === item.key
                                  ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                                  : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                              }`}
                            >
                              <span>{formatMonthLabel(item.year, item.month, locale)}</span>
                              <span
                                className={`text-[10px] ${
                                  month === item.key
                                    ? 'text-white/80'
                                    : 'text-[var(--portal-color-text-tertiary)]'
                                }`}
                              >
                                ({item.count})
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {/* Active Filter Indicators Bar */}
          {(category || month || tag) && (
            <div className="mb-6 flex items-center flex-wrap gap-2 text-xs">
              <span className="text-[var(--portal-color-text-tertiary)] flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {t('activeFilters')}
              </span>
              {currentCategoryObj && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] px-2.5 py-1 font-medium">
                  <Folder className="h-3 w-3" />
                  {getCategoryName(currentCategoryObj, locale)}
                  <Link href={getFilterUrl({ cat: null })} className="hover:opacity-75">
                    <X className="h-3 w-3 ml-0.5" />
                  </Link>
                </span>
              )}
              {month && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] px-2.5 py-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  {currentMonthItem
                    ? formatMonthLabel(currentMonthItem.year, currentMonthItem.month, locale)
                    : (() => {
                        const parts = month.split('-');
                        const y = parseInt(parts[0] || '0', 10);
                        const m = parseInt(parts[1] || '0', 10);
                        return y && m ? formatMonthLabel(y, m, locale) : month;
                      })()}
                  <Link href={getFilterUrl({ mo: null })} className="hover:opacity-75">
                    <X className="h-3 w-3 ml-0.5" />
                  </Link>
                </span>
              )}
              <Link
                href="/blog"
                className="text-[var(--portal-color-text-tertiary)] underline hover:text-[var(--portal-color-primary)] ml-1"
              >
                {t('clearAll')}
              </Link>
            </div>
          )}

          {/* Main Posts Listing */}
          {loadingPosts && posts.length === 0 ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-[var(--portal-color-border)] p-6 bg-[var(--portal-color-surface)]"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 dark:bg-gray-800"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 dark:bg-gray-800"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-800"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="flex flex-col">
              {posts.map((post) => (
                <PostCard key={post.id} post={post as any} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-8">
              <p className="text-[var(--portal-color-text-secondary)] text-sm mb-4">
                {t('noPosts')}
              </p>
              {(category || month || tag) && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--portal-color-primary)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t('viewAllPosts')}
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {page > 1 && (
                <Link
                  href={getFilterUrl({ pg: page - 1 })}
                  className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)] px-4 py-1.5 text-xs font-medium"
                >
                  {t('previous')}
                </Link>
              )}
              <span className="text-xs text-[var(--portal-color-text-secondary)]">
                {t('pageOffset', { page, totalPages: pagination.totalPages })}
              </span>
              {page < pagination.totalPages && (
                <Link
                  href={getFilterUrl({ pg: page + 1 })}
                  className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)] px-4 py-1.5 text-xs font-medium"
                >
                  {t('next')}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar Column (Desktop Only ≥ 1024px) */}
        <aside className="hidden lg:block shrink w-[200px] xl:w-[240px] 2xl:w-[280px] min-w-[180px] max-w-[280px] space-y-6">
          <div className="space-y-6">
            {/* Categories Sidebar Box */}
            <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)] border-b border-[var(--portal-color-border)] pb-3">
                <Folder className="h-3.5 w-3.5 text-[var(--portal-color-primary)]" />
                <span>{t('allCategories')}</span>
              </div>
              <div className="space-y-1">
                <Link
                  href={getFilterUrl({ cat: null })}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    !category
                      ? 'bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] font-semibold'
                      : 'text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                  }`}
                >
                  <span>{t('all')}</span>
                  <span className="text-[10px] font-mono text-[var(--portal-color-text-tertiary)]">
                    {categories.reduce((acc, c) => acc + (c._count?.posts ?? 0), 0)}
                  </span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={getFilterUrl({ cat: cat.slug })}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      category === cat.slug
                        ? 'bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] font-semibold'
                        : 'text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                    }`}
                  >
                    <span className="truncate pr-2">{getCategoryName(cat, locale)}</span>
                    <span className="text-[10px] font-mono text-[var(--portal-color-text-tertiary)] shrink-0">
                      {cat._count.posts}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Monthly Archives Sidebar Box */}
            <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)] border-b border-[var(--portal-color-border)] pb-3">
                <Calendar className="h-3.5 w-3.5 text-[var(--portal-color-primary)]" />
                <span>{t('archives')}</span>
              </div>
              {years.length === 0 ? (
                <p className="text-xs text-[var(--portal-color-text-tertiary)] py-2">
                  {t('noArchives')}
                </p>
              ) : (
                <div className="space-y-3">
                  <Link
                    href={getFilterUrl({ mo: null })}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      !month
                        ? 'bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] font-semibold'
                        : 'text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                    }`}
                  >
                    <span>{t('allTime')}</span>
                  </Link>
                  {years.map((y, idx) => {
                    const isCollapsed = collapsedYears[y] ?? idx >= 2;
                    return (
                      <div
                        key={y}
                        className="border-t border-[var(--portal-color-border)]/60 pt-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => toggleYearCollapse(y)}
                          className="flex items-center justify-between w-full text-[11px] font-mono font-bold text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)] transition-colors mb-1 px-1"
                        >
                          <span>{y}</span>
                          <div className="flex items-center gap-1 text-[10px] text-[var(--portal-color-text-tertiary)]">
                            <span>
                              ({archivesByYear[y].reduce((acc, item) => acc + item.count, 0)})
                            </span>
                            {isCollapsed ? (
                              <ChevronRight className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </button>
                        {!isCollapsed && (
                          <div className="space-y-0.5 mt-1 pl-1">
                            {archivesByYear[y].map((item) => (
                              <Link
                                key={item.key}
                                href={getFilterUrl({ mo: item.key })}
                                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                                  month === item.key
                                    ? 'bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] font-semibold'
                                    : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                                }`}
                              >
                                <span>{formatMonthLabel(item.year, item.month, locale)}</span>
                                <span className="text-[10px] font-mono text-[var(--portal-color-text-tertiary)]">
                                  {item.count}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
