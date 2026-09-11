import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { BlogList } from '@/components/blog/BlogList';
import { getAlternates } from '@/lib/seo';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string; tag?: string; month?: string }>;
}

export async function generateMetadata({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const sParams = searchParams ? await searchParams : {};
  const t = await getTranslations({ locale, namespace: 'Blog' });

  let pageTitle = t('title');
  if (sParams.category) {
    const catName = sParams.category.charAt(0).toUpperCase() + sParams.category.slice(1);
    pageTitle = `${catName} | ${t('title')}`;
  } else if (sParams.tag) {
    pageTitle = `#${sParams.tag} | ${t('title')}`;
  } else if (sParams.month) {
    pageTitle = `${sParams.month} | ${t('title')}`;
  }

  return {
    title: pageTitle,
    description: t('latestPosts'),
    alternates: getAlternates('/blog', locale),
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const sParams = searchParams ? await searchParams : {};

  // Set requested locale for translation mappings
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Blog' });

  let displayTitle = t('title');
  if (sParams.category) {
    displayTitle = `${sParams.category.charAt(0).toUpperCase() + sParams.category.slice(1)} - ${t('title')}`;
  } else if (sParams.tag) {
    displayTitle = `#${sParams.tag} - ${t('title')}`;
  } else if (sParams.month) {
    displayTitle = `${sParams.month} - ${t('title')}`;
  }

  return (
    <Suspense
      fallback={
        <div className="pt-8 md:pt-16 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-[1536px]">
          <div className="flex justify-center items-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {/* Left Balance Spacer Skeleton */}
            <div
              className="hidden min-[1250px]:block shrink w-[200px] xl:w-[240px] 2xl:w-[280px] min-w-[180px] max-w-[280px]"
              aria-hidden="true"
            />

            {/* Post List Skeleton Column */}
            <div className="w-full max-w-3xl shrink min-w-0">
              {/* Header Skeleton with Semantic H1 */}
              <div className="flex items-baseline mb-6 md:mb-8" style={{ gap: '.8rem' }}>
                <span
                  style={{
                    width: 28,
                    height: 2,
                    background: 'var(--portal-color-primary)',
                    flexShrink: 0,
                  }}
                />
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
                  {displayTitle}
                </h1>
              </div>

              {/* Post List Skeleton */}
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
            </div>

            {/* Sidebar Skeleton Column */}
            <aside className="hidden lg:block shrink w-[200px] xl:w-[240px] 2xl:w-[280px] min-w-[180px] max-w-[280px] space-y-6">
              <div className="space-y-6">
                <div className="animate-pulse rounded-2xl border border-[var(--portal-color-border)] p-5 bg-[var(--portal-color-surface)] h-48"></div>
                <div className="animate-pulse rounded-2xl border border-[var(--portal-color-border)] p-5 bg-[var(--portal-color-surface)] h-48"></div>
              </div>
            </aside>
          </div>
        </div>
      }
    >
      <BlogList />
    </Suspense>
  );
}
