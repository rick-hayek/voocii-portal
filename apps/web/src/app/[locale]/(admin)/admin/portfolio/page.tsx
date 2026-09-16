'use client';

import { Eye, Pencil, Star, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  techStack: string[];
  sortOrder: number;
  featured: boolean;
}

export default function AdminPortfolioPage() {
  const t = useTranslations('Admin.portfolio');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/api/trpc/admin.projectList?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const data = await res.json();
      setProjects(data[0]?.result?.data?.json ?? []);
    } catch (e) {
      console.error('Failed to load projects', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    await fetch('/api/trpc/admin.projectDelete?batch=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ '0': { json: { id } } }),
    });
    loadProjects();
  }

  async function toggleFeatured(id: string, featured: boolean) {
    await fetch('/api/trpc/admin.projectUpdate?batch=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ '0': { json: { id, featured: !featured } } }),
    });
    loadProjects();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">{t('title')}</h1>
        <Link
          href="/admin/portfolio/new"
          className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t('addProject')}
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton elements do not have a natural id
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]"
            />
          ))
        ) : projects.length === 0 ? (
          <p className="py-8 text-center text-[var(--portal-color-text-secondary)]">
            {t('noProjects')}
          </p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--portal-color-text)]">{p.title}</span>
                  {p.featured && (
                    <span className="rounded-full bg-[var(--portal-color-primary)]/10 px-2 py-0.5 text-xs text-[var(--portal-color-primary)]">
                      {t('featured')}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-[var(--portal-color-background)] px-1.5 py-0.5 text-xs text-[var(--portal-color-text-secondary)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => toggleFeatured(p.id, p.featured)}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors cursor-pointer ${
                    p.featured
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                      : 'border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)]'
                  }`}
                >
                  <Star className="h-3.5 w-3.5" fill={p.featured ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">
                    {p.featured ? t('featured') : t('normal')}
                  </span>
                </button>
                <a
                  href={`/portfolio/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('view')}</span>
                </a>
                <Link
                  href={`/admin/portfolio/${p.id}`}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('edit')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('delete')}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
