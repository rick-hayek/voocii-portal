'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface Book {
  id: string;
  slug: string;
  title: string;
  coverImageURL: string | null;
  coverImage: string | null;
  author: string;
  publisher: string | null;
  translator: string | null;
  isbn: string | null;
  description: string | null;
  review: string | null;
}

export default function AdminBooksPage() {
  const t = useTranslations('Admin.books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/api/trpc/admin.bookList?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const data = await res.json();
      setBooks(data[0]?.result?.data?.json ?? []);
    } catch {
      setError(t('saveFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      const res = await fetch('/api/trpc/admin.bookDelete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { id },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        alert(data[0].error.message ?? t('saveFailed'));
      } else {
        loadBooks();
      }
    } catch {
      alert(t('saveFailed'));
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)]">
            {t('title')}
          </h1>
        </div>
        <Link
          href="/admin/books/new"
          className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          {t('addBook')}
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}

      {books.length === 0 ? (
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-12 text-center">
          <p className="text-[var(--portal-color-text-secondary)] mb-4">{t('noBooks')}</p>
          <Link
            href="/admin/books/new"
            className="inline-flex rounded-lg border border-compat px-4 py-2 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]"
          >
            {t('addBook')}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-[var(--portal-color-text)]">
              <thead>
                <tr className="border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] font-medium text-[var(--portal-color-text-secondary)]">
                  <th className="hidden md:table-cell px-6 py-4">{t('coverUrlLabel')}</th>
                  <th className="px-6 py-4">{t('titleLabel')}</th>
                  <th className="hidden md:table-cell px-6 py-4">{t('authorLabel')}</th>
                  <th className="hidden md:table-cell px-6 py-4">{t('categoryLabel')}</th>
                  <th className="px-6 py-4 text-right">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--portal-color-border)]">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-[var(--portal-color-surface-alt)]/50">
                    <td className="hidden md:table-cell px-6 py-4">
                      {book.coverImage || book.coverImageURL ? (
                        <img
                          src={book.coverImage ?? book.coverImageURL ?? ''}
                          alt={book.title}
                          className="h-12 w-8 object-cover rounded shadow-sm border border-[var(--portal-color-border)]"
                        />
                      ) : (
                        <div className="flex h-12 w-8 items-center justify-center rounded bg-[var(--portal-color-surface-alt)] text-xs text-[var(--portal-color-text-tertiary)] border border-[var(--portal-color-border)] font-bold">
                          📚
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{book.title}</td>
                    <td className="hidden md:table-cell px-6 py-4">{book.author}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-[var(--portal-color-text-secondary)]">
                      {book.publisher ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <Link
                          href={`/books/${book.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('view')}</span>
                        </Link>
                        <Link
                          href={`/admin/books/${book.id}`}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('edit')}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(book.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('delete')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
