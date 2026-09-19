import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAlternates } from '@/lib/seo';
import { getTRPCServer } from '@/lib/trpc-server';

interface Book {
  id: string;
  slug: string;
  title: string;
  coverImageURL: string | null;
  author: string;
  publisher: string | null;
  translator: string | null;
  isbn: string | null;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  return {
    title: tNav('books'),
    alternates: getAlternates('/books', locale),
  };
}

export default async function PublicBooksPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Books' });

  let books: Book[] = [];
  let error = '';

  try {
    const trpc = await getTRPCServer();
    books = await trpc.book.list();
  } catch (err) {
    console.error('Failed to load books:', err);
    error = 'Failed to load books';
  }

  return (
    <div className="w-full">
      <div className="pt-8 md:pt-24 pb-12 md:pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Section header */}
        <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
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
            {t('recommendedBooks')}
          </span>
          <h1
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
          >
            {t('title')}
          </h1>
        </div>

        {error ? (
          <div className="rounded-xl bg-red-500/10 p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-16 text-center">
            <p className="text-[var(--portal-color-text-secondary)] font-medium">{t('noBooks')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-8 sm:gap-y-12">
            {books.map((book) => {
              const coverSrc = book.coverImageURL ?? '';
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  className="group flex flex-row sm:flex-col gap-4 sm:gap-0 no-underline items-start"
                >
                  {/* Book Cover Container */}
                  <div className="relative mb-0 sm:mb-4 aspect-[3/4] w-20 sm:w-full shrink-0 overflow-hidden rounded-xl bg-[var(--portal-color-surface-alt)] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.22)] border border-[var(--portal-color-border)]/50">
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                        <span className="text-4xl mb-2">📚</span>
                        <span className="text-xs font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                          No Cover
                        </span>
                      </div>
                    )}
                    {/* Subtle Spine effect */}
                    <div className="absolute left-0 top-0 h-full w-2.5 bg-gradient-to-r from-black/20 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 pl-1 flex-1 py-1">
                    <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-[var(--portal-color-text)] transition-colors group-hover:text-[var(--portal-color-primary)]">
                      {book.title}
                    </h3>
                    <p className="truncate text-xs text-[var(--portal-color-text-secondary)]">
                      {book.author}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
