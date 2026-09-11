import {
  ArrowUpRight,
  Book,
  Calendar,
  FileJson,
  FileText,
  Hash,
  Link2,
  Shield,
  Terminal,
  User,
  Wrench,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getCategoryName } from '@/lib/category';
import siteConfig from '@/site.config';
import type { LayoutProps } from './ClassicLayout';

export function MetroLayout({
  locale,
  authorName,
  authorRole,
  authorStackArr,
  heroTitle1,
  heroTitle2,
  heroDesc,
  aboutDesc,
  t,
  tGuestbook,
  posts,
  projects,
  books,
  links = [],
  postCount,
  projectCount,
  guestbookCount,
}: LayoutProps) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName || siteConfig.site.author || 'Rick',
    url: siteConfig.site.url,
    sameAs: [
      process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/rick-hayek',
      process.env.NEXT_PUBLIC_X_URL || 'https://x.com/wevoocii',
    ],
    jobTitle: authorRole || 'Full-Stack Engineer',
    knowsAbout: authorStackArr || ['TypeScript', 'Next.js', 'tRPC', 'Prisma'],
  };

  // Requirement 1: Top-Right Latest 2 Blog Posts
  const post1 = posts[0];
  const post2 = posts[1];

  // Requirement 2: Core Stack tags (from Tech Stack in admin config)
  const stackTags =
    authorStackArr && authorStackArr.length > 0
      ? authorStackArr
      : ['Next.js', 'TypeScript', 'Vue', 'Python', 'AI Agent'];

  // Requirement 4: Latest 4 Books
  const latestBooks = books.slice(0, 4);

  // Requirement 5: Latest 4 Tools
  const tools = [
    {
      id: 'markdown-editor',
      name: 'Markdown',
      icon: <FileText className="h-4 w-4" />,
      href: '/tools/markdown-editor',
    },
    {
      id: 'json-formatter',
      name: 'JSON',
      icon: <FileJson className="h-4 w-4" />,
      href: '/tools/json-formatter',
    },
    {
      id: 'base64',
      name: 'Base64',
      icon: <Hash className="h-4 w-4" />,
      href: '/tools/base64',
    },
    {
      id: 'jwt-decoder',
      name: 'JWT',
      icon: <Shield className="h-4 w-4" />,
      href: '/tools/jwt-decoder',
    },
  ];

  // Requirement 3: Network Friend Links
  const friendLinks = links.slice(0, 5);
  const remainingLinkCount = Math.max(0, links.length - 5);

  const featuredProject = projects[0];

  return (
    <div className="flex w-full flex-col bg-[#121414] text-[#e2e2e2] min-h-screen selection:bg-[#fbbc00] selection:text-[#402d00] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* MAIN METRO GRID CONTAINER */}
      <main className="flex-grow px-4 sm:px-8 py-8 sm:py-12 max-w-[1400px] mx-auto w-full">
        {/* Masonry Tile Grid (12-cols desktop, 6-cols tablet, 2-cols mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-3 auto-rows-[minmax(190px,auto)]">
          {/* ================================================================= */}
          {/* ROW 1 & 2: HERO TILE (spans 8 cols, 2 rows) */}
          {/* ================================================================= */}
          <div className="col-span-2 md:col-span-6 lg:col-span-8 row-span-2 bg-[#fbbc00] text-[#402d00] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden group rounded-none">
            <div className="flex-1 flex flex-col justify-center z-10 pr-0 md:pr-6">
              {/* Role Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#402d00] text-[#ffe2ab] text-[0.7rem] font-bold uppercase tracking-widest self-start mb-6 rounded-none">
                <span className="h-2 w-2 bg-[#00e3fd]" />
                {authorRole || t('badge')}
              </div>

              {/* Title */}
              <h1 className="text-[clamp(2.2rem,4vw,3.8rem)] font-black leading-[1.08] tracking-tight mb-4 text-[#402d00] uppercase">
                {heroTitle1}
                <br />
                <span className="bg-[#402d00] text-[#ffe2ab] px-2 py-0.5 inline-block mt-1">
                  {heroTitle2}
                </span>
              </h1>

              {/* Description */}
              <p className="text-[0.95rem] sm:text-[1.05rem] leading-relaxed text-[#5c4300] max-w-2xl mb-8 font-medium border-l-4 border-[#402d00] pl-4">
                {heroDesc}
              </p>
            </div>

            {/* CTAs */}
            <div className="z-10 flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/blog"
                className="px-6 py-3 bg-[#402d00] text-[#ffe2ab] hover:bg-black hover:text-white transition-colors duration-150 text-[0.82rem] font-black uppercase tracking-wider no-underline inline-flex items-center gap-2 rounded-none"
              >
                {t('exploreBlog')} →
              </Link>
              <Link
                href="/portfolio"
                className="px-6 py-3 border-2 border-[#402d00] text-[#402d00] hover:bg-[#402d00] hover:text-[#ffe2ab] transition-colors duration-150 text-[0.82rem] font-bold uppercase tracking-wider no-underline rounded-none"
              >
                {t('viewProjects')}
              </Link>
            </div>
          </div>

          {/* ================================================================= */}
          {/* TOP RIGHT BLOG TILE #1 (spans 4 cols, 1 row) */}
          {/* ================================================================= */}
          {post1 ? (
            <Link
              href={`/blog/${post1.slug}`}
              className="col-span-2 md:col-span-6 lg:col-span-4 row-span-1 bg-[#00e3fd] text-[#00363d] p-6 flex flex-col justify-between no-underline group hover:brightness-105 transition-all rounded-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest bg-[#00363d] text-[#00e3fd] px-2 py-1">
                    LATEST BLOG
                  </span>
                  <FileText className="h-5 w-5 text-[#00363d] group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight line-clamp-2 my-3 text-[#00363d] font-sans">
                  {post1.title}
                </h2>
              </div>

              <div className="font-mono text-[0.72rem] text-[#00363d] flex items-center gap-3 mt-3 font-bold uppercase">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#00363d]" />
                  <span>
                    {post1.publishedAt
                      ? new Date(post1.publishedAt)
                        .toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        .toUpperCase()
                      : 'RECENT'}
                  </span>
                </div>
                {post1.category && (
                  <span className="text-[0.6rem] font-mono font-bold uppercase tracking-wider bg-[#00363d] text-[#00e3fd] px-2 py-0.5">
                    {getCategoryName(post1.category, locale)}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="col-span-2 md:col-span-6 lg:col-span-4 row-span-1 bg-[#00e3fd] text-[#00363d] p-6 flex items-center justify-center">
              <span className="font-mono text-xs uppercase">NO ARTICLES YET</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* TOP RIGHT BLOG TILE #2 (spans 4 cols, 1 row) */}
          {/* ================================================================= */}
          {post2 ? (
            <Link
              href={`/blog/${post2.slug}`}
              className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 bg-[#282a2b] text-[#e2e2e2] p-6 border-2 border-[#3d4041] flex flex-col justify-between no-underline group hover:border-[#00e3fd] transition-colors rounded-none"
            >
              <div>
                <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-2 mb-1.5 text-[#e2e2e2] group-hover:text-[#00e3fd] transition-colors font-sans">
                  {post2.title}
                </h3>
                {post2.excerpt && (
                  <p className="text-[0.78rem] text-[#a0a2a4] line-clamp-2 leading-relaxed font-sans">
                    {post2.excerpt}
                  </p>
                )}
              </div>

              <div className="font-mono text-[0.72rem] text-[#9c8f78] flex items-center gap-3 mt-4 font-semibold uppercase">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#9c8f78]" />
                  <span>
                    {post2.publishedAt
                      ? new Date(post2.publishedAt)
                        .toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        .toUpperCase()
                      : 'RECENT'}
                  </span>
                </div>
                {post2.category && (
                  <span className="text-[0.6rem] font-mono font-bold uppercase tracking-wider bg-[#37393a] text-[#00e3fd] px-2 py-0.5">
                    {getCategoryName(post2.category, locale)}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 bg-[#282a2b] text-[#9c8f78] p-6 border-2 border-[#3d4041] flex items-center justify-center font-mono text-xs uppercase">
              NO SECONDARY LOG
            </div>
          )}

          {/* ================================================================= */}
          {/* ROW 3 & 4: FEATURED PORTFOLIO PROJECT TILE (spans 4 cols, 2 rows) */}
          {/* ================================================================= */}
          {featuredProject ? (
            <Link
              href={`/portfolio/${featuredProject.slug}`}
              className="col-span-2 md:col-span-3 lg:col-span-4 row-span-2 bg-[#ffdfd4] text-[#5c1a00] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group no-underline border-4 border-transparent hover:border-[#5c1a00] transition-colors rounded-none"
            >
              <div>
                <span className="text-[0.65rem] font-black uppercase tracking-widest bg-[#5c1a00] text-[#ffdfd4] px-3 py-1 inline-block mb-4">
                  FEATURED PROJECT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase leading-tight text-[#5c1a00] mb-3">
                  {featuredProject.title}
                </h2>
                <p className="text-[0.88rem] leading-relaxed font-medium text-[#822800] line-clamp-3 mb-6">
                  {featuredProject.description}
                </p>
              </div>

              <div>
                {featuredProject.techStack && featuredProject.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {featuredProject.techStack.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-[#5c1a00] text-[#ffdfd4] text-[0.65rem] font-mono font-bold px-2 py-0.5 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="w-full py-3 bg-[#5c1a00] text-[#ffdfd4] group-hover:bg-black group-hover:text-white text-center text-[0.8rem] font-black uppercase tracking-wider block transition-colors">
                  VIEW CASE STUDY →
                </div>
              </div>
            </Link>
          ) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 row-span-2 bg-[#ffdfd4] text-[#5c1a00] p-8 flex items-center justify-center font-mono text-xs uppercase">
              NO FEATURED PROJECT
            </div>
          )}

          {/* ================================================================= */}
          {/* ROW 3: CORE STACK TILE (spans 4 cols, 1 row) */}
          {/* ================================================================= */}
          <div className="col-span-2 md:col-span-6 lg:col-span-4 row-span-1 bg-[#4f46e5] text-white p-6 flex flex-col justify-between rounded-none">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-5 w-5 text-white" />
              <h3 className="text-base font-black uppercase tracking-wider font-sans">
                CORE STACK
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 my-auto">
              {stackTags.map((tech) => (
                <span
                  key={tech}
                  className="text-[0.72rem] font-mono font-extrabold uppercase bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* ================================================================= */}
          {/* ROW 3: READING TILE (Latest 4 Books) (spans 2 cols, 1 row, PERFECT SQUARE) */}
          {/* ================================================================= */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 row-span-1 aspect-square bg-[#6b21a8] text-white p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden group rounded-none">
            {/* Absolute overlay link covering the tile (goes to /books) */}
            <Link href="/books" className="absolute inset-0 z-0" aria-label="View all books" />

            <div className="flex items-center justify-between mb-1 shrink-0 z-10 pointer-events-none">
              <h3 className="text-[0.65rem] font-mono font-extrabold uppercase tracking-widest text-white flex items-center gap-1">
                READING
              </h3>
              <Book className="h-3.5 w-3.5 text-white/80" />
            </div>

            {/* 2x2 Book Thumbnails Grid (Each book links to /books/${book.slug}) */}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 flex-1 min-h-0 w-full my-0.5 z-10">
              {latestBooks.length > 0 ? (
                latestBooks.map((book: any) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    className="relative w-full h-full min-h-0 bg-[#3b0764] border border-white/10 overflow-hidden hover:border-white/60 transition-colors flex items-center justify-center no-underline z-10"
                    title={book.title}
                  >
                    {book.coverImageURL ? (
                      <img
                        src={book.coverImageURL}
                        alt={book.title}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-[0.55rem] font-mono font-bold line-clamp-2 leading-tight text-white/90 p-0.5 text-center">
                        {book.title}
                      </span>
                    )}
                  </Link>
                ))
              ) : (
                <div className="col-span-2 row-span-2 flex items-center justify-center font-mono text-[0.6rem] text-white/60">
                  NO BOOKS
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* ROW 3: ARSENAL TILE (Latest 4 Tools) (spans 2 cols, 1 row, PERFECT SQUARE) */}
          {/* ================================================================= */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 row-span-1 aspect-square bg-[#0d9488] text-white p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden group rounded-none">
            {/* Absolute overlay link covering the tile (goes to /tools) */}
            <Link href="/tools" className="absolute inset-0 z-0" aria-label="View all tools" />

            <div className="flex items-center justify-between mb-1 shrink-0 z-10 pointer-events-none">
              <h3 className="text-[0.65rem] font-mono font-extrabold uppercase tracking-widest text-white flex items-center gap-1">
                ARSENAL
              </h3>
              <Wrench className="h-3.5 w-3.5 text-white/80" />
            </div>

            {/* 2x2 Tools Grid (Each tool links to tool.href) */}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 flex-1 min-h-0 w-full my-0.5 z-10">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="bg-[#115e59] hover:bg-[#14b8a6] transition-colors p-1 flex flex-col items-center justify-center text-center text-white min-h-0 w-full h-full no-underline z-10"
                  title={tool.name}
                >
                  <div className="mb-0.5 shrink-0">{tool.icon}</div>
                  <span className="text-[0.55rem] font-mono font-bold uppercase truncate w-full">
                    {tool.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ================================================================= */}
          {/* ROW 4: NETWORK TILE (Friend Links) (spans 4 cols, 1 row under Core Stack) */}
          {/* ================================================================= */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 bg-[#e11d48] text-white p-5 flex flex-col justify-between relative overflow-hidden group rounded-none">
            {/* Absolute overlay link covering the tile (goes to /links) */}
            <Link
              href="/links"
              className="absolute inset-0 z-0"
              aria-label="View all friend links"
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-2 z-10 pointer-events-none">
              <h3 className="text-[0.7rem] font-mono font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5">
                NETWORK
              </h3>
              <Link2 className="h-4 w-4 text-white/80" />
            </div>

            {/* Avatars Row (z-10 sits above overlay link) */}
            <div className="flex items-center gap-2.5 my-auto flex-wrap z-10">
              {links.length > 0 ? (
                links.slice(0, 5).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${link.name}${link.description ? ` — ${link.description}` : ''}`}
                    className="relative group/avatar flex items-center justify-center transition-transform hover:scale-110 no-underline shrink-0"
                  >
                    {link.avatar ? (
                      <img
                        src={link.avatar}
                        alt={link.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/40 group-hover/avatar:border-white transition-colors shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/20 border-2 border-white/40 group-hover/avatar:border-white transition-colors flex items-center justify-center font-bold text-xs text-white">
                        {link.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </a>
                ))
              ) : (
                <span className="font-mono text-xs text-white/80">NO FRIEND LINKS</span>
              )}

              {links.length > 5 && (
                <Link
                  href="/links"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 hover:border-white transition-colors flex items-center justify-center font-mono font-bold text-xs text-white no-underline shrink-0 z-10"
                  title="View all friends"
                >
                  +{links.length - 5}
                </Link>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* ROW 4: ABOUT TILE (spans 4 cols, 1 row under Reading & Arsenal) */}
          {/* ================================================================= */}
          <Link
            href="/about"
            className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 bg-[#1a1c1c] text-[#e2e2e2] p-5 border-2 border-[#333535] flex flex-col justify-between no-underline group hover:border-[#00e3fd] transition-colors rounded-none overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] font-mono font-extrabold uppercase tracking-widest text-[#00e3fd] flex items-center gap-1.5">
                ABOUT ME
              </span>
              <User className="h-4 w-4 text-[#00e3fd]" />
            </div>

            <p className="text-[0.78rem] text-[#9c8f78] font-mono line-clamp-2 leading-relaxed my-auto">
              {aboutDesc || heroDesc}
            </p>

            <div className="text-[0.7rem] font-mono font-bold text-[#00e3fd] flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase">
              KNOW MORE ABOUT ME →
            </div>
          </Link>
        </div>

        {/* STATS STRIP */}
        {/* <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="p-4 bg-[#1a1c1c] border-l-4 border-[#fbbc00] rounded-none">
            <div className="text-[0.65rem] font-mono uppercase tracking-widest text-[#9c8f78] mb-1">
              {tGuestbook('stats.posts')}
            </div>
            <div className="text-2xl font-black font-mono text-[#e2e2e2]">{postCount}</div>
          </div>

          <div className="p-4 bg-[#1a1c1c] border-l-4 border-[#00e3fd] rounded-none">
            <div className="text-[0.65rem] font-mono uppercase tracking-widest text-[#9c8f78] mb-1">
              {tGuestbook('stats.projects')}
            </div>
            <div className="text-2xl font-black font-mono text-[#e2e2e2]">{projectCount}</div>
          </div>

          <div className="p-4 bg-[#1a1c1c] border-l-4 border-[#ffb9a1] rounded-none">
            <div className="text-[0.65rem] font-mono uppercase tracking-widest text-[#9c8f78] mb-1">
              {tGuestbook('stats.guestbook')}
            </div>
            <div className="text-2xl font-black font-mono text-[#e2e2e2]">{guestbookCount}</div>
          </div>
        </div> */}
      </main>
    </div>
  );
}
