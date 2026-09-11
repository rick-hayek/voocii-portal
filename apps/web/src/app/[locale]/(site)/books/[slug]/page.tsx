import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAlternates } from '@/lib/seo';
import { getTRPCServer } from '@/lib/trpc-server';
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
    return {
      title: `${book.title} | ${tNav('books')}`,
      description: book.description || book.review || '',
      alternates: getAlternates(`/books/${slug}`, locale),
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

  return <BookDetailClient initialBook={book} />;
}
