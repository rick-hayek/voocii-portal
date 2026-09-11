import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  generateBreadcrumbSchema,
  getAbsoluteImageUrl,
  getAlternates,
  getCanonicalUrl,
} from '@/lib/seo';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';
import { BookDetailClient } from './BookDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  try {
    const trpc = await getTRPCServer();
    const book = await trpc.book.get({ slug });
    if (!book) return { title: 'Not Found' };
    const tNav = await getTranslations({ locale, namespace: 'Navigation' });
    const title = `${book.title} | ${tNav('books')}`;
    const description = book.description || book.review || '';
    const canonicalUrl = getCanonicalUrl(`/books/${slug}`, locale);
    const coverImageUrl = getAbsoluteImageUrl(book.coverImageURL);

    return {
      title,
      description,
      alternates: getAlternates(`/books/${slug}`, locale),
      openGraph: {
        type: 'website',
        title,
        description,
        url: canonicalUrl,
        siteName: siteConfig.site.title,
        images: coverImageUrl
          ? [
              {
                url: coverImageUrl,
                alt: book.title,
              },
            ]
          : undefined,
      },
      twitter: {
        card: coverImageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        images: coverImageUrl ? [coverImageUrl] : undefined,
      },
    };
  } catch {
    return { title: 'Book Details' };
  }
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let book = null;
  try {
    const trpc = await getTRPCServer();
    book = await trpc.book.get({ slug });
  } catch {
    // Ignore fetch error, fallback to client fetch
  }

  if (!book) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  const canonicalUrl = getCanonicalUrl(`/books/${book.slug}`, locale);
  const coverImageUrl = getAbsoluteImageUrl(book.coverImageURL);

  const bookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    isbn: book.isbn || undefined,
    publisher: book.publisher
      ? {
          '@type': 'Organization',
          name: book.publisher,
        }
      : undefined,
    image: coverImageUrl,
    description: book.description || book.review || undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav('home'), url: getCanonicalUrl('', locale) },
    { name: tNav('books'), url: getCanonicalUrl('/books', locale) },
    { name: book.title, url: canonicalUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BookDetailClient initialBook={book} />
    </>
  );
}
