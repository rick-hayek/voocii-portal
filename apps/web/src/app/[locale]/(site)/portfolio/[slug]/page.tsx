import { marked } from 'marked';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MermaidRenderer } from '@/components/blog/MermaidRenderer';
import { getAlternates } from '@/lib/seo';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';

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
  createdAt: string | Date;
  privacyPolicy?: string | null;
  privacyPolicyEn?: string | null;
  termsOfService?: string | null;
  termsOfServiceEn?: string | null;
  logo?: string | null;
  downloadLinks?: any;
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  try {
    const trpc = await getTRPCServer();
    const project = (await trpc.portfolio.bySlug({ slug })) as Project | null;
    if (!project) return { title: 'Not Found' };
    const tNav = await getTranslations({ locale, namespace: 'Navigation' });
    return {
      title: `${project.title} | ${tNav('portfolio')}`,
      description: project.description ?? '',
      alternates: getAlternates(`/portfolio/${slug}`, locale),
    };
  } catch {
    return { title: 'Project Details' };
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  let project: Project | null = null;

  try {
    const trpc = await getTRPCServer();
    project = (await trpc.portfolio.bySlug({ slug })) as Project | null;
  } catch (err) {
    console.error('Failed to load project details:', err);
  }

  if (!project) {
    notFound();
  }

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description:
      locale === 'en' && project.descriptionEn ? project.descriptionEn : project.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    screenshot: project.coverImage || undefined,
    downloadUrl: project.liveUrl || undefined,
    softwareVersion: '1.0.0',
    publisher: {
      '@type': 'Person',
      name: siteConfig.site.author || 'Rick',
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />

      <div className="mt-4 flex items-center gap-3">
        {project.logo && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {project.logo.includes('<svg') ? (
              <div
                className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: project.logo }}
              />
            ) : (
              <img src={project.logo} alt="" className="h-full w-full object-contain" />
            )}
          </div>
        )}
        <h1 className="text-3xl font-bold text-[var(--portal-color-text)]">{project.title}</h1>
      </div>

      {/* Cover */}
      {project.coverImage && (
        <Image
          src={project.coverImage}
          alt={project.title}
          width={800}
          height={450}
          className="mt-6 w-full rounded-xl border border-compat object-cover"
        />
      )}

      {/* Description */}
      <div
        className="mt-6 prose prose-portal max-w-none text-[var(--portal-color-text)]"
        dangerouslySetInnerHTML={{
          __html: marked.parse(
            locale === 'en' && project.descriptionEn ? project.descriptionEn : project.description,
          ),
        }}
      />

      {/* Tech stack */}
      {project.techStack.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-[var(--portal-color-surface)] px-3 py-1 text-sm text-[var(--portal-color-text)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Download Section */}
      {project.downloadLinks &&
        (() => {
          try {
            const links =
              typeof project.downloadLinks === 'string'
                ? JSON.parse(project.downloadLinks)
                : project.downloadLinks;
            if (!Array.isArray(links) || links.length === 0) return null;
            return (
              <div className="mt-8 border-t border-[var(--portal-color-border)] pt-6">
                <h2 className="mb-4 text-base font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
                  Available Downloads
                </h2>
                <div className="flex flex-wrap gap-4 items-center">
                  {links.map((link, idx) => {
                    let badgeContent = null;
                    if (link.platform === 'appstore') {
                      badgeContent = (
                        <svg
                          viewBox="0 0 135 40"
                          style={{ height: 40 }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="135"
                            height="40"
                            rx="6"
                            fill="#000"
                            stroke="#a6a6a6"
                            strokeWidth="0.8"
                          />
                          <path
                            d="M21.5 22.5c0-2.4 2-3.6 2-3.7-1.1-1.6-2.9-1.8-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.2-.9-1.6 0-3.1.9-3.9 2.4-1.7 3-0.4 7.4 1.2 9.7.8 1.1 1.7 2.4 2.9 2.3 1.1 0 1.6-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-.1 2.8-1.2.9-1.3 1.3-2.6 1.3-2.7 0 0-2-0.8-2-3.1"
                            fill="#fff"
                          />
                          <path
                            d="M17.8 15.3c0.6-.8 1.1-1.9.9-3 1 .1 2.2.7 2.9 1.6.6.7 1.1 1.9 1 3-1.1.1-2.2-.6-2.8-1.6"
                            fill="#fff"
                          />
                          <text
                            x="35"
                            y="15"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="6.5"
                            fontWeight="500"
                          >
                            Download on the
                          </text>
                          <text
                            x="35"
                            y="29"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="14"
                            fontWeight="700"
                          >
                            App Store
                          </text>
                        </svg>
                      );
                    } else if (link.platform === 'playstore') {
                      badgeContent = (
                        <svg
                          viewBox="0 0 135 40"
                          style={{ height: 40 }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="135"
                            height="40"
                            rx="6"
                            fill="#000"
                            stroke="#a6a6a6"
                            strokeWidth="0.8"
                          />
                          <g transform="translate(10, 10) scale(0.8)">
                            <path
                              d="M1 1.8c-.2.2-.3.5-.3.9v19.6c0 .4.1.7.3.9l.1.1L12.3 12v-.2L1 1.8z"
                              fill="#3bccff"
                            />
                            <path
                              d="M16 15.8l-3.7-3.8v-.2L16 8.2l.1.1 4.4 2.5c1.3.7 1.3 1.9 0 2.6l-4.4 2.5-.1-.1z"
                              fill="#ffdd00"
                            />
                            <path
                              d="M12.3 12L1 1.8c.4-.4 1-.4 1.7 0l13.3 7.6L12.3 12z"
                              fill="#ff3a44"
                            />
                            <path
                              d="M12.3 12L16 15.8l-13.3 7.6c-.7.4-1.3.4-1.7 0L12.3 12z"
                              fill="#00e676"
                            />
                          </g>
                          <text
                            x="38"
                            y="14"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="6"
                            fontWeight="500"
                            letterSpacing="0.5"
                          >
                            GET IT ON
                          </text>
                          <text
                            x="38"
                            y="29"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="13"
                            fontWeight="700"
                          >
                            Google Play
                          </text>
                        </svg>
                      );
                    } else if (link.platform === 'windows') {
                      badgeContent = (
                        <svg
                          viewBox="0 0 135 40"
                          style={{ height: 40 }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="135"
                            height="40"
                            rx="6"
                            fill="#000"
                            stroke="#a6a6a6"
                            strokeWidth="0.8"
                          />
                          <path
                            d="M10 14.5 L17.5 13.5 L17.5 19.5 L10 19.5 Z M10 20.5 L17.5 20.5 L17.5 26.5 L10 25.5 Z M18.5 13.3 L27 12 L27 19.5 L18.5 19.5 Z M18.5 20.5 L27 20.5 L27 28 L18.5 26.7 Z"
                            fill="#fff"
                          />
                          <text
                            x="35"
                            y="15"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="6"
                            fontWeight="500"
                          >
                            Download for
                          </text>
                          <text
                            x="35"
                            y="29"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="12"
                            fontWeight="700"
                          >
                            Windows
                          </text>
                        </svg>
                      );
                    } else if (link.platform === 'macos') {
                      badgeContent = (
                        <svg
                          viewBox="0 0 135 40"
                          style={{ height: 40 }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="135"
                            height="40"
                            rx="6"
                            fill="#000"
                            stroke="#a6a6a6"
                            strokeWidth="0.8"
                          />
                          <path
                            d="M21.5 22.5c0-2.4 2-3.6 2-3.7-1.1-1.6-2.9-1.8-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.2-.9-1.6 0-3.1.9-3.9 2.4-1.7 3-0.4 7.4 1.2 9.7.8 1.1 1.7 2.4 2.9 2.3 1.1 0 1.6-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-.1 2.8-1.2.9-1.3 1.3-2.6 1.3-2.7 0 0-2-0.8-2-3.1"
                            fill="#fff"
                          />
                          <path
                            d="M17.8 15.3c0.6-.8 1.1-1.9.9-3 1 .1 2.2.7 2.9 1.6.6.7 1.1 1.9 1 3-1.1.1-2.2-.6-2.8-1.6"
                            fill="#fff"
                          />
                          <text
                            x="35"
                            y="15"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="6"
                            fontWeight="500"
                          >
                            Download for
                          </text>
                          <text
                            x="35"
                            y="29"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="12"
                            fontWeight="700"
                          >
                            macOS
                          </text>
                        </svg>
                      );
                    } else if (link.platform === 'linux') {
                      badgeContent = (
                        <svg
                          viewBox="0 0 135 40"
                          style={{ height: 40 }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="135"
                            height="40"
                            rx="6"
                            fill="#000"
                            stroke="#a6a6a6"
                            strokeWidth="0.8"
                          />
                          <path
                            d="M10 15 L15 20 L10 25 M17 25 L25 25"
                            stroke="#fff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <text
                            x="35"
                            y="15"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="6"
                            fontWeight="500"
                          >
                            Download for
                          </text>
                          <text
                            x="35"
                            y="29"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="12"
                            fontWeight="700"
                          >
                            Linux
                          </text>
                        </svg>
                      );
                    } else if (link.platform === 'apk') {
                      badgeContent = (
                        <svg
                          viewBox="0 0 135 40"
                          style={{ height: 40 }}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="135"
                            height="40"
                            rx="6"
                            fill="#000"
                            stroke="#a6a6a6"
                            strokeWidth="0.8"
                          />
                          <g fill="#fff">
                            <path d="M11.5 22.5 C11.5 26.5 14.5 28.5 18.5 28.5 C22.5 28.5 25.5 26.5 25.5 22.5 L25.5 17.5 L11.5 17.5 Z" />
                            <path d="M18.5 11.5 C14.5 11.5 12 14 11.7 16.5 L25.3 16.5 C25 14 22.5 11.5 18.5 11.5 Z" />
                            <circle cx="15.5" cy="14" r="0.8" fill="#000" />
                            <circle cx="21.5" cy="14" r="0.8" fill="#000" />
                            <line
                              x1="14.5"
                              y1="12"
                              x2="12.5"
                              y2="9.5"
                              stroke="#fff"
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                            <line
                              x1="22.5"
                              y1="12"
                              x2="24.5"
                              y2="9.5"
                              stroke="#fff"
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </g>
                          <text
                            x="35"
                            y="15"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="6"
                            fontWeight="500"
                          >
                            Download
                          </text>
                          <text
                            x="35"
                            y="29"
                            fill="#fff"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            fontSize="12"
                            fontWeight="700"
                          >
                            APK File
                          </text>
                        </svg>
                      );
                    }
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block transition-transform hover:scale-[1.02] shrink-0"
                      >
                        {badgeContent}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          } catch {
            return null;
          }
        })()}

      {/* Links */}
      <div className="mt-8 flex gap-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View Live →
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-compat px-5 py-2.5 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface)]"
          >
            Source Code
          </a>
        )}
        {(locale === 'en'
          ? project.privacyPolicyEn || project.privacyPolicy
          : project.privacyPolicy) && (
          <a
            href={`/portfolio/${project.slug}/Privacy_Policy`}
            className="rounded-lg border border-compat px-5 py-2.5 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface)]"
          >
            Privacy Policy
          </a>
        )}
        {(locale === 'en'
          ? project.termsOfServiceEn || project.termsOfService
          : project.termsOfService) && (
          <a
            href={`/portfolio/${project.slug}/Terms_of_Service`}
            className="rounded-lg border border-compat px-5 py-2.5 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface)]"
          >
            Terms of Service
          </a>
        )}
      </div>
      <MermaidRenderer />
    </div>
  );
}
