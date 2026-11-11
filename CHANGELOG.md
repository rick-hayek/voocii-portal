# Changelog

All notable changes to the Voocii Portal project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [1.0.7] - 2026-09-11

### Added
- **LLM RAG & Machine-Readable Feeds**: Provide `/llms.txt` and `/llms-full.txt` standard endpoints for LLM context curation and RAG crawlers, along with raw Markdown endpoints (`/api/raw/blog/[slug]`) for clean article content retrieval.
- **Enhanced SEO & Structured Data**: Implement rich OpenGraph and Twitter card metadata, Schema.org `BreadcrumbList` JSON-LD structured data, and a unified SEO alternates helper for canonical URLs and `hreflang` language tags.
- **Serverless Connection Pooling**: Add `DIRECT_URL` configuration to Prisma schema and Turborepo environment for seamless compatibility with PostgreSQL connection poolers (e.g., Supabase / Neon / PgBouncer).

### Fixed & Improved
- **Timezone-Aware Blog Archive Filtering**: Dynamically compute local timezone UTC ranges on the client when querying by month (`/blog?month=YYYY-MM`), resolving calendar date boundary mismatches across different global timezones.
- **Preserve Post Modification Timestamps on Views**: Switch `Post.views` page counter incrementation to raw SQL execution, preventing page view tracking from unintentionally updating the `updatedAt` article modification timestamp.
- **Friend Link Sorting Priority**: Update public link listings to sort by `sortOrder` priority first and `createdAt` (order of addition) second, ensuring newly added links reliably appear at the end.

## [1.0.6] - 2026-08-28

### Added
- **Analytics Data Pruning & Archival**: Background log retention and baseline archival utility (`pnpm db:prune-analytics`), aggregating historical totals into permanent baseline records while safely purging expired raw page view rows.
- **Project Architecture Audit & Analysis Toolkit**: Integrated automated codebase analysis tools and comprehensive multi-language architecture reports covering frontend component trees, Prisma database schema, and tRPC API routers.

## [1.0.5] - 2026-08-27

### Added
- **Transactional Email Service**: Multi-provider email notification infrastructure (SendGrid, Mailgun) supporting friendship link review approval alerts and automated comment reply notifications with user preference controls.
- **Nested Threaded Comments**: Recursive multi-level comment tree structure, deep linking with deterministic hash anchors (`#comment-xxxxxx`), relative date formatting ("x hours ago", "yesterday"), and honeypot anti-bot defense with admin moderation toggle.
- **Friendship Link Application & Management**: Raw text paste auto-parser for quick link application, input length validation, admin review & approval workflow, and one-click copy buttons for YAML/JSON site configuration snippets.
- **Configurable Avatar Service**: Template-based avatar URL generation supporting Cravatar, WeAvatar, Gravatar, and DiceBear with custom placeholder interpolation (`{hash}`, `{size}`, `{fallback}`).
- **Blog Post View Tracking**: Real-time page view tracking with client-side batching (`PageViewTracker`), database counter (`Post.views`), and composite indexing.

### Changed
- **Admin Panel Localization**: Comprehensive internationalization (`next-intl`) across all admin dashboard modules (`/[locale]/admin/*`) with modular tRPC sub-routers.
- **Links Page SSR Migration**: Migrated public links page to React Server Components (RSC) with extracted interactive client components for instant first-contentful paint.

## [1.0.4] - 2026-08-17

### Added
- **HTTP / API Client Tool**: Add browser-based HTTP request debugging & Webhook testing tool (`/tools/http-client`) supporting GET/POST/PUT/DELETE/HEAD/OPTIONS methods, query params builder, headers editor, JSON/Form/Text payload formatting, Auth presets, cURL/Fetch snippet export, IndexNow template, and optional server proxy to bypass CORS.
- **Bing Search & SEO Optimizations**: Integrate Bing Webmaster Tools & IndexNow verification, fix missing `<h1>` semantic tags on SSR pre-rendered book detail (`/books/[slug]`) and blog list (`/blog`) pages.

## [1.0.3] - 2026-08-15

### Added
- **Online Link Application**: Fast and intuitive friendship link application channel featuring real-time card preview, dynamic RSS badge rendering, and anti-bot protection (honeypot trap, timing token, rate limiting, and interactive math security challenge).

## [1.0.2] - 2026-08-14

### Added
- **QR Code**： Add QR code generator tool with custom styling and logo support.([`3b078a5`](https://github.com/rick-hayek/voocii-portal/commit/3b078a5b5597b4d4a4c7403406fa0fc8463ae230))

## [1.0.0] - 2026-08-13

### Added
- **Metro Grid Layout (Tessellate Noir)**: Microsoft Windows Metro-style 9-tile grid layout with custom accent color tokens (`#fbbc00`, `#00e3fd`, `#ffdfd4`, `#4f46e5`, `#e11d48`, `#6b21a8`, `#0d9488`).
- **Dynamic Layout Dispatching**: Configurable `homeLayout` (`'classic'` | `'metro'`) in `site.config.ts` supporting extensible homepage layout components.
- **RSC Sub-link Navigation**: Pure React Server Component (RSC) Z-Index layer overlay pattern for nested tile links (books, tools, network avatars) with 0 JS hydration overhead.
- **Theme Engine Integration**: Dark Neon theme locking in Metro mode with zero white-flash background transitions.

([`fc16105`](https://github.com/rick-hayek/voocii-portal/commit/fc16105bfb34b8d566a959b16461de207391834f))

## [0.5.0] - 2026-07-17

### Added
- **Authenticated REST API (v1)**: Implement REST API routes (`/api/v1/posts`, `/api/v1/categories`) with API key authentication for external integrations ([`6b62417`](https://github.com/rick-hayek/voocii-portal/commit/6b6241752245c69424aef4bcae025ef43aa32202)).

## [0.4.0] - 2026-07-14

### Changed
- **Cloudflare R2 Attachment Storage**: Migrate file attachment storage from PostgreSQL byte arrays to Cloudflare R2 object storage with redirect-based asset serving ([`bfba2ae`](https://github.com/rick-hayek/voocii-portal/commit/bfba2aef43c30eaae5666e30e709aff2861dd201)).

## [0.3.0] - 2026-07-05

### Added
- **AI & Open-Source Trending Page**: Dedicated AI & GitHub trending repository tracking page (`/trending`) featuring weekly star growth data aggregation ([`d187eca`](https://github.com/rick-hayek/voocii-portal/commit/d187eca7246912d744171a961d6d555fd1080517)).

## [0.2.0] - 2026-02-21

### Added
- **Internationalization (i18n)**: Implement full English and Chinese localization with `next-intl`, i18n-aware routing middleware, and locale dictionary files ([`a94eed2`](https://github.com/rick-hayek/voocii-portal/commit/a94eed21bbf38a97cc2e6c56f1feefbe9841544a)).

## [0.1.0] - 2026-02-13

### Added
- **Initial Project Release**: Initialize core project structure with Next.js 16 App Router application, Turborepo monorepo packages, tRPC API, and Prisma ORM PostgreSQL schema ([`e20fc69`](https://github.com/rick-hayek/voocii-portal/commit/e20fc69ee65f755cf33c1a7149f149f9f0068280)).
