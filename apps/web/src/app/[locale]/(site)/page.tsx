import { prisma } from '@portal/db';
import { getTranslations } from 'next-intl/server';
import { layoutMap } from '@/components/home/layouts';
import { getAlternates } from '@/lib/seo';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';

export const revalidate = 60; // revalidate at most every minute (ISR)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    alternates: getAlternates('', locale),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Index' });
  const tGuestbook = await getTranslations({ locale, namespace: 'Guestbook' });
  const trpcServer = await getTRPCServer();

  // Parallelize all DB/tRPC calls to optimize performance and guarantee zero transition skeleton flashes
  const [
    aboutData,
    postsData,
    projects,
    allBooks,
    guestbookData,
    links,
    postCount,
    projectCount,
    guestbookCount,
  ] = await Promise.all([
    trpcServer.about.getAbout(),
    trpcServer.post.list({ page: 1, limit: 3, status: 'published' }),
    trpcServer.portfolio.list({ featured: true }),
    trpcServer.book.list(),
    trpcServer.guestbook.list({ page: 1, limit: 4 }),
    trpcServer.link.list(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.project.count(),
    prisma.guestbookEntry.count(),
  ]);

  const authorObj = aboutData?.author as any;
  const hasAuthorConfig =
    authorObj && typeof authorObj === 'object' && Object.keys(authorObj).length > 0;

  const authorName = hasAuthorConfig ? authorObj.name : 'Rick';
  const authorRole = hasAuthorConfig
    ? locale === 'en'
      ? authorObj.role_en || authorObj.role
      : authorObj.role
    : locale === 'en'
      ? 'Full-Stack Engineer'
      : '全栈开发者';

  let authorStackArr: string[] | null = null;
  if (hasAuthorConfig) {
    if (authorObj.stack) {
      authorStackArr = Array.isArray(authorObj.stack)
        ? authorObj.stack
        : String(authorObj.stack)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
    }
  } else {
    authorStackArr = ['.NETCore', 'TypeScript', 'Vue', 'Python', 'AI Agent'];
  }

  const authorStatus = hasAuthorConfig ? authorObj.status : '';

  const developerEntries: { label: string; element: React.ReactNode }[] = [];

  if (authorName) {
    developerEntries.push({
      label: 'name',
      element: <span className="text-emerald-600 dark:text-emerald-400">'{authorName}'</span>,
    });
  }

  if (authorRole) {
    developerEntries.push({
      label: 'role',
      element: <span className="text-emerald-600 dark:text-emerald-400">'{authorRole}'</span>,
    });
  }

  if (authorStackArr && authorStackArr.length > 0) {
    developerEntries.push({
      label: 'stack',
      element: (
        <>
          [
          {authorStackArr.map((item: string, i: number) => (
            <span key={item}>
              <span className="text-emerald-600 dark:text-emerald-400">'{item}'</span>
              {i < authorStackArr.length - 1 ? ', ' : ''}
            </span>
          ))}
          ]
        </>
      ),
    });
  }

  if (authorStatus) {
    developerEntries.push({
      label: 'status',
      element: <span className="text-emerald-600 dark:text-emerald-400">'{authorStatus}'</span>,
    });
  }

  const heroTitle1 = hasAuthorConfig
    ? (locale === 'en' ? authorObj.title1_en || authorObj.title1 : authorObj.title1) || t('title1')
    : t('title1');

  const heroTitle2 = hasAuthorConfig
    ? (locale === 'en' ? authorObj.title2_en || authorObj.title2 : authorObj.title2) || t('title2')
    : t('title2');

  const heroDesc = hasAuthorConfig
    ? (locale === 'en'
        ? authorObj.description_en || authorObj.description
        : authorObj.description) || t('description')
    : t('description');

  const aboutDesc =
    (locale === 'en'
      ? aboutData?.description_en || aboutData?.description
      : aboutData?.description || aboutData?.description_en) || heroDesc;

  const posts = postsData.posts;
  const books = allBooks.slice(0, 4);
  const guestbookEntries = guestbookData.entries;

  const layoutProps = {
    locale,
    authorName,
    authorRole,
    authorStackArr,
    developerEntries,
    heroTitle1,
    heroTitle2,
    heroDesc,
    aboutDesc,
    t: (key: string) => t(key as any),
    tGuestbook: (key: string) => tGuestbook(key as any),
    posts,
    projects,
    books,
    guestbookEntries,
    links,
    postCount,
    projectCount,
    guestbookCount,
  };

  // Dispatch layout based on site.config.ts configuration
  const activeLayout = siteConfig.homeLayout || 'classic';
  const ActiveLayoutComponent = layoutMap[activeLayout] || layoutMap.classic;

  return <ActiveLayoutComponent {...layoutProps} />;
}
