'use client';

import { Eye, FileCode, Link2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  createdAt: string;
}

export default function AttachmentsAdminPage() {
  const t = useTranslations('Admin.attachments');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/api/trpc/attachment.list?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const data = await res.json();
      setAttachments(data[0]?.result?.data?.json ?? []);
    } catch (e) {
      console.error('Failed to load attachments', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    setError('');
    setSuccess('');
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setFileData(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fileData || !fileName) {
      setError('Please select or drag a file to upload.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/trpc/attachment.create?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              filename: fileName,
              mimeType: mimeType,
              fileData: fileData,
            },
          },
        }),
      });

      const json = await res.json();
      if (json[0]?.error) {
        setError(json[0].error.message ?? 'Failed to upload attachment');
      } else {
        setSuccess('Attachment successfully uploaded!');
        setFileData('');
        setFileName('');
        setMimeType('');
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await loadAttachments();
      }
    } catch {
      setError('Network error during upload');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await fetch('/api/trpc/attachment.delete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: { id } } }),
      });
      await loadAttachments();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const copyMarkdown = (filename: string, id: string) => {
    const mdCode = `![${filename}](/uploads/${filename})`;
    navigator.clipboard.writeText(mdCode).then(() => {
      setCopiedId(`${id}-md`);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  const copyLink = (filename: string, id: string) => {
    const linkPath = `/uploads/${filename}`;
    navigator.clipboard.writeText(linkPath).then(() => {
      setCopiedId(`${id}-link`);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">{t('title')}</h1>

      <div className="grid gap-6 lg:grid-cols-3 min-w-0 w-full">
        {/* Right 1 Column - Upload Form */}
        <div className="space-y-4">
          <form
            onSubmit={handleUpload}
            className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 space-y-4"
          >
            <h2 className="text-md font-bold text-[var(--portal-color-text)]">{t('upload')}</h2>

            {error && (
              <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-green-50 p-2.5 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </p>
            )}

            {/* Drag and Drop Zone */}
            <div>
              <label
                htmlFor="file-input"
                className="mb-1 block text-xs font-semibold text-[var(--portal-color-text)]"
              >
                {t('upload')}
              </label>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: drag and drop wrapper */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="presentation"
                className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--portal-color-border)] bg-[var(--portal-color-background)] p-8 text-center cursor-pointer hover:border-[var(--portal-color-primary)] transition-colors min-h-[160px]"
              >
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {fileData && mimeType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  // biome-ignore lint/performance/noImgElement: dynamic upload preview
                  <img
                    src={`data:${mimeType};base64,${fileData}`}
                    alt="preview"
                    className="max-h-24 max-w-full rounded-md object-contain mb-2"
                  />
                ) : (
                  <span className="text-3xl mb-2">📁</span>
                )}
                <span className="text-xs text-[var(--portal-color-text-secondary)] font-medium break-all px-2">
                  {fileName ? fileName : 'Drag & drop a file here, or click to browse'}
                </span>
                <span className="mt-1 text-[10px] text-[var(--portal-color-text-secondary)]/70">
                  Max size: 5MB
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !fileData}
              className="w-full rounded-lg bg-[var(--portal-color-primary)] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Uploading…' : t('upload')}
            </button>
          </form>
        </div>

        {/* Left 2 Columns - List */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="overflow-x-auto rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--portal-color-surface)]">
                <tr className="border-b border-[var(--portal-color-border)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)] w-16">
                    Preview
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)] hidden md:table-cell">
                    {t('colName')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)] w-28 hidden md:table-cell">
                    {t('colType')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)] w-28 hidden md:table-cell">
                    {t('colDate')}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--portal-color-text-secondary)] w-56 whitespace-nowrap">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <tr key="skeleton-1" className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                    <tr key="skeleton-2" className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                    <tr key="skeleton-3" className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                    <tr key="skeleton-4" className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                  </>
                ) : attachments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-[var(--portal-color-text-secondary)]"
                    >
                      {t('noAttachments')}
                    </td>
                  </tr>
                ) : (
                  attachments.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--portal-color-border)] hover:bg-[var(--portal-color-background)]/30"
                    >
                      <td className="px-4 py-3">
                        {item.mimeType.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          // biome-ignore lint/performance/noImgElement: dynamic database file preview
                          <img
                            src={`/uploads/${item.filename}`}
                            alt={item.filename}
                            className="h-10 w-10 object-cover rounded-md border border-[var(--portal-color-border)]"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] text-lg">
                            📄
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--portal-color-text)] truncate max-w-[200px] hidden md:table-cell">
                        {item.filename}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--portal-color-text-secondary)] hidden md:table-cell">
                        {item.mimeType}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--portal-color-text-secondary)] hidden md:table-cell">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => copyMarkdown(item.filename, item.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors cursor-pointer"
                          >
                            <FileCode className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {copiedId === `${item.id}-md` ? t('copied') : 'Copy MD'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyLink(item.filename, item.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors cursor-pointer"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {copiedId === `${item.id}-link` ? t('copied') : t('copyUrl')}
                            </span>
                          </button>
                          <a
                            href={`/uploads/${item.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('view')}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('delete')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
