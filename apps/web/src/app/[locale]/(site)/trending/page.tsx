'use client';

import { toPng } from 'html-to-image';
import { Download, Flame, Sparkles, Star, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSWR } from '@/hooks/useLocalSWR';

// GitHub language color mapping
const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Ruby: '#701516',
  Shell: '#89e051',
  Jupyter: '#DA5B0B',
  Dart: '#00B4AB',
  'Jupyter Notebook': '#DA5B0B',
};

interface TrendingRepo {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsGrowth: number;
  repoCreatedAt: string;
  topics: string[];
  summaryZh: string | null;
  summaryEn: string | null;
  weekOf: string;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TrendingPage() {
  const t = useTranslations('Trending');
  const locale = useLocale();

  const { data: session } = useSession();
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [isWeekOpen, setIsWeekOpen] = useState(false);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setSavingImage(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#0b0f19',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `Weekly_AI_Trending_${selectedWeek || 'latest'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to generate image:', e);
      alert('Failed to save image. Please try again.');
    } finally {
      setSavingImage(false);
    }
  };

  useEffect(() => {
    if (!isWeekOpen) return;
    const closeMenu = () => setIsWeekOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isWeekOpen]);

  // Fetch available weeks
  const { data: weeksData } = useLocalSWR(
    'trending-weeks',
    useCallback(async () => {
      const res = await fetch('/api/trpc/trending.weeks?batch=1');
      const data = await res.json();
      return (data[0]?.result?.data?.json ?? []) as string[];
    }, []),
  );

  // Optimistically include selectedWeek in weeks list so week selector renders instantly
  const weeks = useMemo(() => {
    const fetched = weeksData ?? [];
    if (selectedWeek && !fetched.includes(selectedWeek)) {
      return [selectedWeek, ...fetched];
    }
    return fetched;
  }, [weeksData, selectedWeek]);

  // Fetch repos for selected week
  const {
    data: reposData,
    loading,
    error: swrError,
  } = useLocalSWR(
    `trending-repos-${selectedWeek || 'latest'}`,
    useCallback(async () => {
      const input = selectedWeek ? { weekOf: selectedWeek } : {};
      const res = await fetch(
        '/api/trpc/trending.list?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: input } })),
      );
      const data = await res.json();
      const result = data[0]?.result?.data?.json;
      if (result?.weekOf && !selectedWeek) {
        setSelectedWeek(result.weekOf);
      }
      return (result?.repos ?? []) as TrendingRepo[];
    }, [selectedWeek]),
  );

  const repos = reposData ?? [];
  const error = swrError ? 'Failed to load trending data' : '';

  return (
    <div className="w-full">
      <div className="pt-8 md:pt-24 pb-12 md:pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Section Header */}
        <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '1.5rem' }}>
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
            {t('sectionLabel')}
          </span>
          <h1
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
          >
            {t('title')}
          </h1>
        </div>

        {/* Subtitle + Week Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <p className="text-sm text-[var(--portal-color-text-secondary)] max-w-lg">
            {t('subtitle')}
          </p>
          <div className="flex items-center gap-2">
            {session && (
              <button
                type="button"
                onClick={() => setIsSummarizeOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer text-xs px-3 py-1.5 rounded-lg bg-[var(--portal-color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t('summarizeBtn')}
              </button>
            )}
            {weeks.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWeekOpen(!isWeekOpen);
                  }}
                  className="flex items-center justify-between gap-2 cursor-pointer text-sm px-3 py-1.5 rounded-lg border border-compat bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]/30"
                  aria-label="Select week"
                >
                  <span className="font-[500]">
                    {selectedWeek
                      ? `${t('weekOf')} ${formatDate(selectedWeek, locale)}`
                      : 'Select Week'}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 text-[var(--portal-color-text-secondary)] transition-transform duration-200 ${
                      isWeekOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <title>Dropdown arrow</title>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isWeekOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]/95 backdrop-blur-md py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                    {weeks.map((w: string) => {
                      const label = `${t('weekOf')} ${formatDate(w, locale)}`;
                      const isActive = selectedWeek === w;

                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            setSelectedWeek(w);
                            setIsWeekOpen(false);
                          }}
                          className={`flex w-full items-center px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-[var(--portal-color-surface-alt)] font-semibold text-[var(--portal-color-primary)]'
                              : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)] hover:text-[var(--portal-color-text)]'
                          }`}
                        >
                          <span className="w-5 text-center shrink-0 mr-1 text-[10px] font-bold">
                            {isActive && '✓'}
                          </span>
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
                key={i}
                className="animate-pulse rounded-xl border border-compat-soft bg-[var(--portal-color-surface)] p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : repos.length === 0 ? (
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-16 text-center">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-[var(--portal-color-text-secondary)] font-medium">{t('noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo, index) => {
              const summary = locale === 'zh' ? repo.summaryZh : repo.summaryEn;
              const langColor = repo.language
                ? (LANG_COLORS[repo.language] ?? '#8b8b8b')
                : undefined;

              return (
                <div
                  key={repo.id}
                  className="group relative rounded-xl border border-compat-soft bg-[var(--portal-color-surface)] p-5 transition-all duration-200 hover:border-[var(--portal-color-primary)]/40 hover:shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header: Repo name + stars */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* GitHub icon */}
                        <svg
                          className="h-5 w-5 shrink-0 text-[var(--portal-color-text-secondary)]"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <title>GitHub Icon</title>
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--portal-color-text)] font-semibold text-[0.95rem] truncate hover:text-[var(--portal-color-primary)] transition-colors no-underline"
                        >
                          {repo.fullName}
                        </a>
                      </div>
                      {((repo as any).consecutiveWeeks ?? 0) > 1 && (
                        <div className="flex items-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap">
                            🔥 {t('consecutiveWeeks', { weeks: (repo as any).consecutiveWeeks })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Star badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-compat bg-transparent text-[var(--portal-color-text-secondary)] text-xs font-semibold">
                        <svg
                          className="h-3.5 w-3.5 text-amber-500"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <title>Stars</title>
                          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                        </svg>
                        <span>{formatNumber(repo.stars)}</span>
                      </div>
                      {repo.starsGrowth > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 whitespace-nowrap">
                          +{formatNumber(repo.starsGrowth)} {t('starsThisWeek') || 'this week'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content: Display AI Summary if present; fallback to original Description */}
                  {summary ? (
                    <div className="mb-3 rounded-lg bg-[var(--portal-color-primary)]/5 border border-[var(--portal-color-primary)]/10 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs">✨</span>
                        <span className="text-xs font-semibold text-[var(--portal-color-primary)]">
                          {t('summary')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--portal-color-text)] leading-relaxed whitespace-pre-line">
                        {summary}
                      </p>
                    </div>
                  ) : (
                    repo.description && (
                      <p className="text-sm text-[var(--portal-color-text-secondary)] mb-3 line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )
                  )}

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--portal-color-text-secondary)]">
                    {/* Language */}
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: langColor }}
                        />
                        {repo.language}
                      </span>
                    )}

                    {/* Forks */}
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <title>Forks</title>
                        <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                      </svg>
                      {formatNumber(repo.forks)}
                    </span>

                    {/* Created at */}
                    <span>{formatDate(repo.repoCreatedAt, locale)}</span>
                  </div>

                  {/* Topics */}
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {repo.topics.slice(0, 5).map((topic) => (
                        <span
                          key={topic}
                          className="inline-block rounded-full bg-[var(--portal-color-primary)]/10 px-2.5 py-0.5 text-[0.68rem] font-medium text-[var(--portal-color-primary)]"
                        >
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 5 && (
                        <span className="text-xs text-[var(--portal-color-text-secondary)] self-center">
                          +{repo.topics.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summarize Modal */}
      {isSummarizeOpen && (
        <div
          onClick={() => setIsSummarizeOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
        >
          {/* Centering wrapper that allows vertical scrolling if viewport is too short */}
          <div className="my-auto flex flex-col items-center py-4">
            {/* Card Content wrapper to capture (strictly 350x620) */}
            <div
              ref={cardRef}
              onClick={(e) => e.stopPropagation()}
              className="w-[350px] h-[620px] rounded-2xl bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#1e293b] text-white pt-[18px] pb-[12px] px-5 flex flex-col justify-between relative overflow-hidden shadow-2xl shrink-0 border border-white/10"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {/* Background glows */}
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                      AI Trending Repo
                    </span>
                  </div>
                  {/* <span className="text-[9px] text-white/30 font-mono">Voocii</span> */}
                  <span className="text-[9px] text-white/50 font-mono">
                    Week of {formatDate(selectedWeek || new Date().toISOString(), locale)}
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-white mb-0.5">
                  {t('summarizeTitle')}
                </h2>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-1.5" />
              </div>

              {/* Card Body - Top 10 repos (very compact) */}
              <div className="flex-1 flex flex-col justify-center gap-[6px] mt-1.5 mb-2 overflow-hidden relative z-10">
                {repos.slice(0, 10).map((repo, idx) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Badge */}
                      <span
                        className={`flex items-center justify-center w-[22px] h-[22px] rounded-full font-mono text-[11px] font-black shrink-0 ${
                          idx === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900'
                            : idx === 1
                              ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900'
                              : idx === 2
                                ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white'
                                : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Name, Language & Streak */}
                      <div className="min-w-0 leading-tight">
                        <p className="font-bold text-[13px] text-white truncate">{repo.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {repo.language && (
                            <span className="text-[9px] text-white/40 leading-none">
                              {repo.language}
                            </span>
                          )}
                          {((repo as any).consecutiveWeeks ?? 0) > 1 && (
                            <span className="text-[8px] font-bold text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded-xs border border-amber-400/20 leading-none shrink-0">
                              🔥{' '}
                              {t('consecutiveWeeksShort', {
                                weeks: (repo as any).consecutiveWeeks,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stars Growth */}
                    <div className="text-right shrink-0 leading-tight">
                      <div className="flex items-center justify-end gap-0.5 text-[11px] font-bold text-white">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        <span>{formatNumber(repo.stars)}</span>
                      </div>
                      {repo.starsGrowth > 0 && (
                        <p className="text-[9px] text-emerald-400 font-bold leading-none mt-0.5">
                          +{formatNumber(repo.starsGrowth)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 mt-auto pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-white/40">
                <div className="space-y-0.5">
                  <p className="font-semibold text-white/70 leading-none">Voocii</p>
                  <p className="leading-none">AI-driven personal platform</p>
                </div>
                <div className="text-right font-mono space-y-0.5">
                  <p className="leading-none">Generated by AI Agent</p>
                  {/* <p className="leading-none">Explore more at voocii.com</p> */}
                </div>
              </div>
            </div>

            {/* Action buttons (Not captured in image) */}
            <div onClick={(e) => e.stopPropagation()} className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={savingImage}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-slate-900 font-semibold text-xs shadow-lg hover:bg-white/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                {savingImage ? t('saving') : t('saveImage')}
              </button>
              <button
                type="button"
                onClick={() => setIsSummarizeOpen(false)}
                className="flex items-center justify-center h-8.5 w-8.5 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all cursor-pointer border border-white/10"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
