'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useLocalSWR } from '@/hooks/useLocalSWR';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  descriptionEn?: string | null;
  coverImage: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  techStack: string[];
  featured: boolean;
  logo?: string | null;
  downloadLinks?: any;
}

function PlatformBadge({
  platform,
  url,
  showLabel = true,
}: {
  platform: string;
  url?: string;
  showLabel?: boolean;
}) {
  const configs: Record<string, { label: string; bg: string; icon: React.ReactNode }> = {
    appstore: {
      label: 'App Store',
      bg: 'bg-slate-950/90 hover:bg-black border-white/30 text-white shadow-md ring-1 ring-white/10',
      icon: (
        <svg className="h-3.5 w-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.21.67-2.92 1.5-.63.73-1.18 1.89-1.03 3.01 1.13.09 2.28-.64 2.96-1.47z" />
        </svg>
      ),
    },
    playstore: {
      label: 'Google Play',
      bg: 'bg-slate-950/90 hover:bg-black border-emerald-500/40 text-emerald-400 shadow-md ring-1 ring-emerald-500/20',
      icon: (
        <svg className="h-3.5 w-3.5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
          <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.3 0 .58.09.81.25l13.5 8.5c.57.36.75 1.12.39 1.69-.1.16-.23.29-.39.39L4.81 20.75c-.23.16-.51.25-.81.25-.83 0-1.5-.67-1.5-1.5z" />
        </svg>
      ),
    },
    apk: {
      label: 'APK',
      bg: 'bg-slate-950/90 hover:bg-black border-green-500/40 text-green-400 shadow-md ring-1 ring-green-500/20',
      icon: (
        <svg className="h-3.5 w-3.5 fill-current text-green-400 shrink-0" viewBox="0 0 24 24">
          <path d="M17.523 15.3414C17.06 15.3414 16.685 14.9664 16.685 14.5034C16.685 14.0404 17.06 13.6654 17.523 13.6654C17.986 13.6654 18.361 14.0404 18.361 14.5034C18.361 14.9664 17.986 15.3414 17.523 15.3414ZM6.477 15.3414C6.014 15.3414 5.639 14.9664 5.639 14.5034C5.639 14.0404 6.014 13.6654 6.477 13.6654C6.94 13.6654 7.315 14.0404 7.315 14.5034C7.315 14.9664 6.94 15.3414 6.477 15.3414ZM18.064 10.4284L19.789 7.4414C19.92 7.2144 19.843 6.9244 19.616 6.7934C19.389 6.6624 19.099 6.7394 18.968 6.9664L17.214 10.0034C15.654 9.2904 13.889 8.8914 12 8.8914C10.111 8.8914 8.346 9.2904 6.786 10.0034L5.032 6.9664C4.901 6.7394 4.611 6.6624 4.384 6.7934C4.157 6.9244 4.08 7.2144 4.211 7.4414L5.936 10.4284C2.507 12.3024 0.179 15.7764 0 19.8914H24C23.821 15.7764 21.493 12.3024 18.064 10.4284Z" />
        </svg>
      ),
    },
    macos: {
      label: 'macOS',
      bg: 'bg-slate-950/90 hover:bg-black border-sky-500/40 text-sky-400 shadow-md ring-1 ring-sky-500/20',
      icon: (
        <svg className="h-3.5 w-3.5 fill-current text-sky-400 shrink-0" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.21.67-2.92 1.5-.63.73-1.18 1.89-1.03 3.01 1.13.09 2.28-.64 2.96-1.47z" />
        </svg>
      ),
    },
    windows: {
      label: 'Windows',
      bg: 'bg-slate-950/90 hover:bg-black border-blue-500/40 text-blue-400 shadow-md ring-1 ring-blue-500/20',
      icon: (
        <svg className="h-3.5 w-3.5 fill-current text-blue-400 shrink-0" viewBox="0 0 24 24">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8" />
        </svg>
      ),
    },
    linux: {
      label: 'Linux',
      bg: 'bg-slate-950/90 hover:bg-black border-amber-500/40 text-amber-400 shadow-md ring-1 ring-amber-500/20',
      icon: (
        <svg className="h-3.5 w-3.5 fill-current text-amber-400 shrink-0" viewBox="0 0 24 24">
          <path d="M12.012 0c-3.78 0-4.48 3.468-4.48 4.966 0 .543.082 1.25.26 1.888C6.182 7.741 4.7 9.873 4.7 12.33c0 2.284 1.272 4.28 3.14 5.378-.363.92-.857 2.183-1.637 2.993-.314.327.025.864.444.707 1.488-.557 2.9-1.785 3.738-2.678.536.082 1.096.126 1.666.126.55 0 1.091-.042 1.614-.12 1.074.939 2.26 2.052 3.74 2.67.42.158.757-.38.443-.707-.779-.81-1.274-2.072-1.637-2.993 1.868-1.098 3.14-3.094 3.14-5.378 0-2.457-1.482-4.589-3.092-5.476.178-.638.26-1.345.26-1.888 0-1.498-.7-4.966-4.48-4.966z" />
        </svg>
      ),
    },
  };

  const config = configs[platform] || {
    label: platform,
    bg: 'bg-slate-950/90 text-white border-white/20 shadow-md',
    icon: null,
  };

  const badgeClasses = showLabel
    ? `inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${config.bg}`
    : `inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 hover:scale-110 hover:shadow-lg ${config.bg}`;

  const badgeContent = (
    <>
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </>
  );

  if (url) {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }}
        className={`${badgeClasses} shrink-0 cursor-pointer leading-none`}
        title={`Available on ${config.label}`}
      >
        {badgeContent}
      </span>
    );
  }

  return (
    <span
      className={`${badgeClasses} shrink-0 leading-none`}
      title={`Available on ${config.label}`}
    >
      {badgeContent}
    </span>
  );
}

export default function PortfolioPage() {
  const t = useTranslations('Portfolio');
  const locale = useLocale();
  const [activeTech, setActiveTech] = useState<string | null>(null);

  const { data: projectsData, loading: loadingProjects } = useLocalSWR(
    `portfolio-projects-${activeTech || 'all'}`,
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/portfolio.list?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': { json: activeTech ? { tech: activeTech } : {} },
            }),
          ),
      );
      const json = await res.json();
      return (json[0]?.result?.data?.json ?? []) as Project[];
    }, [activeTech]),
  );

  const { data: techStacksData, loading: loadingTechs } = useLocalSWR(
    'portfolio-tech-stacks',
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/portfolio.techStacks?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': { json: null },
            }),
          ),
      );
      const json = await res.json();
      return (json[0]?.result?.data?.json ?? []) as string[];
    }, []),
  );

  const projects = projectsData ?? [];
  const techStacks = techStacksData ?? [];
  const loading = loadingProjects || (loadingTechs && techStacks.length === 0);

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
          ></span>
          <span
            className="font-mono uppercase text-[var(--portal-color-primary)]"
            style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
          >
            {t('selectedWork')}
          </span>
          <h1
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
          >
            {t('title')}
          </h1>
        </div>

        {/* Tech filter */}
        {techStacks.length > 0 && (
          <div
            className="mb-8 flex flex-nowrap overflow-x-auto md:flex-wrap md:overflow-visible pb-2 md:pb-0 gap-2 scrollbar-none"
            style={{
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <button
              onClick={() => setActiveTech(null)}
              className={`rounded-full shrink-0 transition-colors ${
                !activeTech
                  ? 'bg-[var(--portal-color-primary)] text-white'
                  : 'border border-compat text-[var(--portal-color-text-secondary)] hover-border-compat-primary'
              }`}
              style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
            >
              {t('all')}
            </button>
            {techStacks.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveTech(tech)}
                className={`rounded-full shrink-0 transition-colors ${
                  activeTech === tech
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'border border-compat text-[var(--portal-color-text-secondary)] hover-border-compat-primary'
                }`}
                style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-compat"
                style={{
                  height: 320,
                  borderRadius: 16,
                  background: 'var(--portal-color-surface)',
                }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="py-12 text-center text-[var(--portal-color-text-secondary)]">
            {t('noProjects')}
          </p>
        ) : (
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}
          >
            {projects.map((project) => {
              const downloadLinksList: Array<{ platform: string; url?: string }> = (() => {
                if (!project.downloadLinks) return [];
                try {
                  const parsed =
                    typeof project.downloadLinks === 'string'
                      ? JSON.parse(project.downloadLinks)
                      : project.downloadLinks;
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })();

              return (
                <a
                  key={project.id}
                  href={`/portfolio/${project.slug}`}
                  className="group cursor-pointer overflow-hidden border border-compat hover-border-compat-primary no-underline transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'var(--portal-color-surface)', borderRadius: 16 }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.08)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Cover */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      height: 180,
                      background:
                        'linear-gradient(135deg, var(--portal-color-surface-alt), rgba(107,142,201,.06))',
                      fontSize: '3rem',
                    }}
                  >
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      '🚀'
                    )}
                    {project.featured && (
                      <span
                        className="absolute uppercase text-white shadow-md z-10 inline-flex items-center justify-center"
                        style={{
                          top: 12,
                          left: 12,
                          height: 26,
                          background: 'var(--portal-color-primary)',
                          borderRadius: 100,
                          padding: '0 .65rem',
                          fontSize: '.6rem',
                          fontWeight: 700,
                          letterSpacing: '.05em',
                        }}
                      >
                        {t('featured')}
                      </span>
                    )}

                    {/* High-Visibility Platform Badges (Top-Right Overlay) */}
                    {downloadLinksList.length > 0 && (
                      <div
                        className="absolute flex items-center justify-end gap-1.5 z-10"
                        style={{ top: 12, right: 12, height: 26 }}
                      >
                        {downloadLinksList.map((link, idx) => (
                          <PlatformBadge
                            key={link.platform || idx}
                            platform={link.platform}
                            url={link.url}
                            showLabel={downloadLinksList.length <= 2}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '1.3rem' }}>
                    <div
                      className="text-[var(--portal-color-text)] group-hover:text-[var(--portal-color-primary)] transition-colors flex items-center gap-2"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: '.3rem',
                        letterSpacing: '-.02em',
                      }}
                    >
                      {project.logo && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                          {project.logo.includes('<svg') ? (
                            <div
                              className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                              dangerouslySetInnerHTML={{ __html: project.logo }}
                            />
                          ) : (
                            <img
                              src={project.logo}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>
                      )}
                      <span>{project.title}</span>
                    </div>

                    <div
                      className="line-clamp-2 text-[var(--portal-color-text-secondary)]"
                      style={{ fontSize: '.82rem', lineHeight: 1.6, marginBottom: '.8rem' }}
                    >
                      {locale === 'en' && project.descriptionEn
                        ? project.descriptionEn
                        : project.description}
                    </div>

                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap font-mono" style={{ gap: '.3rem' }}>
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[var(--portal-color-primary)]"
                            style={{
                              fontSize: '.6rem',
                              fontWeight: 500,
                              padding: '.2rem .5rem',
                              borderRadius: 6,
                              background: 'rgba(107,142,201,.08)',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
