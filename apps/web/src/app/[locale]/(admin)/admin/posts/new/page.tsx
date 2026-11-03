'use client';

import { Check, Copy } from 'lucide-react';
import { marked } from 'marked';
import { useEffect, useState } from 'react';
import { MermaidRenderer } from '@/components/blog/MermaidRenderer';
import { Dropdown } from '@/components/ui/Dropdown';
import { useRouter } from '@/i18n/routing';

const parseGfmAlertsInHtml = (html: string) => {
  const blockquoteRegex = /<blockquote>([\s\S]*?)<\/blockquote>/gi;
  const alertRegex = /^\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:\r?\n|<br\s*\/?>)?/i;

  return html.replace(blockquoteRegex, (match, content) => {
    const alertMatch = content.match(alertRegex);
    if (alertMatch) {
      const type = alertMatch[1].toUpperCase();
      const configs = {
        NOTE: {
          label: 'Note',
          icon: 'ℹ️',
          classes:
            'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-200',
        },
        TIP: {
          label: 'Tip',
          icon: '💡',
          classes:
            'border-green-500 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-200',
        },
        IMPORTANT: {
          label: 'Important',
          icon: '📢',
          classes:
            'border-purple-500 bg-purple-50/50 text-purple-900 dark:bg-purple-950/20 dark:text-purple-200',
        },
        WARNING: {
          label: 'Warning',
          icon: '⚠️',
          classes:
            'border-yellow-500 bg-yellow-50/50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200',
        },
        CAUTION: {
          label: 'Caution',
          icon: '🚫',
          classes: 'border-red-500 bg-red-50/50 text-red-900 dark:bg-red-950/20 dark:text-red-200',
        },
      };
      const config = configs[type as keyof typeof configs];
      if (config) {
        let cleanedContent = content.replace(alertRegex, '<p>');
        if (cleanedContent.startsWith('<p></p>') || cleanedContent.startsWith('<p>\n</p>')) {
          cleanedContent = cleanedContent.replace(/^<p>\s*<\/p>\s*/, '');
        }

        return `<div class="my-6 border-l-4 p-4 rounded-r-lg ${config.classes}">
          <div class="flex items-center gap-2 font-bold mb-2 text-sm uppercase tracking-wide select-none">
            <span>${config.icon}</span>
            <span>${config.label}</span>
          </div>
          <div class="text-sm space-y-2">
            ${cleanedContent}
          </div>
        </div>`;
      }
    }
    return match;
  });
};

interface Category {
  id: string;
  name: string;
  name_en?: string | null;
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown', err);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    );
  }, [title]);

  // Load categories
  useEffect(() => {
    fetch(
      '/api/trpc/category.list?batch=1&input=' +
        encodeURIComponent(JSON.stringify({ '0': { json: null } })),
    )
      .then((r) => r.json())
      .then((data) => setCategories(data[0]?.result?.data?.json ?? []))
      .catch(() => {});
  }, []);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const catSlug = newCatName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-|-$/g, '');

      const res = await fetch('/api/trpc/admin.categoryCreate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { name: newCatName.trim(), slug: catSlug },
          },
        }),
      });
      const data = await res.json();
      const newCat = data[0]?.result?.data?.json;
      if (newCat) {
        setCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
        setCategoryId(newCat.id);
        setNewCatName('');
        setShowNewCatForm(false);
      }
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setCreatingCat(false);
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/trpc/admin.postCreate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              title,
              slug,
              content,
              excerpt: excerpt || undefined,
              status,
              categoryId: categoryId || undefined,
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to create post');
      } else {
        router.push('/admin/posts');
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="sticky top-0 z-10 -mx-6 px-6 py-4 flex items-center justify-between border-b border-[var(--portal-color-border)] bg-[var(--portal-color-background)]/80 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">New Post</h1>
        <button
          type="submit"
          form="new-post-form"
          disabled={saving}
          className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {saving ? 'Saving...' : status === 'published' ? 'Publish' : 'Save Draft'}
        </button>
      </div>

      <form id="new-post-form" onSubmit={handleSave} className="space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Title */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="post-title"
            className="w-20 shrink-0 text-sm font-medium text-[var(--portal-color-text)] whitespace-nowrap"
          >
            Title
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="flex-1 min-w-0 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            placeholder="Post title"
          />
        </div>

        {/* Slug + Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <label
              htmlFor="post-slug"
              className="w-20 shrink-0 text-sm font-medium text-[var(--portal-color-text)] whitespace-nowrap"
            >
              Slug
            </label>
            <input
              id="post-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="flex-1 min-w-0 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="post-status"
              className="w-20 sm:w-auto shrink-0 text-sm font-medium text-[var(--portal-color-text)] whitespace-nowrap"
            >
              Status
            </label>
            <div className="flex-1 min-w-0" id="post-status">
              <Dropdown
                value={status}
                onChange={(val) => setStatus(val as 'draft' | 'published')}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="post-category"
            className="w-20 shrink-0 text-sm font-medium text-[var(--portal-color-text)] whitespace-nowrap"
          >
            Category
          </label>
          <div
            id="post-category"
            className="flex flex-1 items-center gap-3 min-w-0 flex-wrap sm:flex-nowrap"
          >
            {showNewCatForm ? (
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCat || !newCatName.trim()}
                  className="rounded-lg bg-[var(--portal-color-primary)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {creatingCat ? 'Creating…' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCatForm(false);
                    setNewCatName('');
                  }}
                  className="rounded-lg border border-[var(--portal-color-border)] px-3 py-2 text-xs text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] shrink-0 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <Dropdown
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                    options={[
                      { value: '', label: 'No category' },
                      ...categories.map((c) => ({
                        value: c.id,
                        label: c.name_en ? `${c.name} (${c.name_en})` : c.name,
                      })),
                    ]}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCatForm(true)}
                  className="text-xs font-medium text-[var(--portal-color-primary)] hover:underline focus:outline-none whitespace-nowrap shrink-0 cursor-pointer"
                >
                  + Add New Category
                </button>
              </>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="post-excerpt"
            className="w-20 shrink-0 text-sm font-medium text-[var(--portal-color-text)] whitespace-nowrap"
          >
            Excerpt
          </label>
          <input
            id="post-excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            placeholder="Brief summary (optional)"
          />
        </div>

        {/* Content (Markdown Editor with Preview Tab) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="post-content"
              className="text-sm font-medium text-[var(--portal-color-text)]"
            >
              Content (Markdown)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                title="Copy Markdown"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:bg-[var(--portal-color-background)] transition-colors shadow-sm cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <div className="flex rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTab('edit')}
                  className={`rounded-md px-3 py-1.5 focus:outline-none transition-colors ${
                    tab === 'edit'
                      ? 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] shadow-sm'
                      : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`rounded-md px-3 py-1.5 focus:outline-none transition-colors ${
                    tab === 'preview'
                      ? 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] shadow-sm'
                      : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          {tab === 'edit' ? (
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-3 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              placeholder="Write your article in Markdown…"
            />
          ) : (
            <div className="w-full min-h-[440px] max-h-[600px] overflow-y-auto rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-6 py-5">
              <div
                className="prose prose-portal max-w-none"
                dangerouslySetInnerHTML={{
                  __html: parseGfmAlertsInHtml(marked.parse(content) as string),
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : status === 'published' ? 'Publish' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[var(--portal-color-border)] px-5 py-2.5 text-sm text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)]"
          >
            Cancel
          </button>
        </div>
      </form>
      <MermaidRenderer content={content} />
    </div>
  );
}
