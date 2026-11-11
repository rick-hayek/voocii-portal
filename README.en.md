# Voocii Portal ![Version](https://img.shields.io/badge/version-v1.0.8-blue.svg)

A modern, full-stack personal portal, knowledge base, and portfolio platform built with Next.js 16, tRPC v11, Prisma, and Tailwind CSS v4.

English | [中文](./README.md)

---

## Layout Preview

### Classic Flow Layout
![Classic Homepage](./designs/screenshot/voocii-classic-en.png)

### Metro Grid Layout (Tessellate Noir)
![Metro Homepage](./designs/screenshot/voocii-metro-en.png)

---

## Core Features

- **Modern Full-Stack Framework & Runtime**:
  - **Next.js 16 App Router & Turbopack**: Full leverage of React 19 Server Components (RSC) and concurrent rendering.
  - **Dynamic Dual Homepage Layout Engine**: Out-of-the-box support for both responsive flow (`classic`) and Metro tile grid (`metro` / Tessellate Noir) layouts. Pure server-side RSC dispatching with zero client hydration flash (CLS = 0).
  - **tRPC v11 & Prisma ORM**: End-to-end 100% type-safe API procedure calls and strongly typed PostgreSQL access.
  - **Tailwind CSS v4 & Advanced Theme Engine**: Driven by native CSS variables. Features **6 meticulously crafted modern presets** (`zenith` default, `lumiere` editorial, `dark-neon`, `cyberpunk`, `retro-brown`, and `minimal-light`) with anti-FOUC flash protection.
- **Rich Content & Business Modules**:
  - 📝 **Technical Blog**: MDX rendering, code syntax highlighting, KaTeX math typesetting, Mermaid diagrams. Built-in **Table of Contents (TOC)** powered by `IntersectionObserver` (0% scroll CPU overhead). Full **RSS 2.0 Feed** (`/api/feed.xml`) and **independent post view tracking**.
  - 📚 **Reading List & Book Reviews (Books)**: Curated book collection, ISBN/publisher metadata, direct eBook reading links, original-to-translation self-relations (`originalBook` $\leftrightarrow$ `translations`), and visitor Like/Dislike ratings.
  - 🔥 **AI Trending Repositories (AI Trending)**: Weekly automated tracking of trending AI/LLM GitHub repositories with star delta calculation, automated bilingual AI summaries, and weekly snapshot archives.
  - 🎨 **Portfolio Showcase**: Project card grids, multi-platform binary download distribution (`downloadLinks`), and dedicated bilingual *Privacy Policy* & *Terms of Service* sub-pages.
  - 🛠️ **Developer Utilities (Tools)**: 6 self-contained Web tools (Base64 encoder/decoder, JSON Formatter & validator, JWT decoder, QR Code generator, HTTP Client API tester with CORS proxy, and live split-screen Markdown editor).
  - 🔗 **Friend Links & Guestbook**: Visitor submission workflow, anti-spam rate limiting by IP, multi-avatar auto-resolution, and 3-state moderation.
  - 📄 **Online Resume & 🖼️ Masonry Lightbox Gallery**.
- **Open Ecosystem & AI Agent Friendly (LLM Readiness)**:
  - 🔌 **Open REST API v1 (`/api/v1`)**: Secured via `ADMIN_API_KEY`, bridging directly into internal tRPC logic for external automation scripts and MCP (Model Context Protocol) Agents.
  - 🤖 **Native LLM Endpoints**: Standard-compliant `/llms.txt` and `/llms-full.txt` structured knowledge bases, plus clean raw Markdown endpoints for articles (`/api/raw/blog/[slug]`).
- **Transactional Email Service**:
  - Pluggable provider architecture (built-in **Mailgun** and **SendGrid** support, extensible to SMTP/Resend).
  - Automated transactional notifications for approved friend links, published comments, and discussion replies.
- **High-Throughput & Resilient Infrastructure**:
  - ☁️ **Cloudflare R2 Object Storage**: Direct file/media uploads and global CDN delivery, completely offloading binary BLOB payloads from PostgreSQL.
  - 🔍 **Resilient Dual-Mode Search**: High-performance MeiliSearch full-text indexing with **automatic graceful fallback to PostgreSQL `ILIKE`** queries if MeiliSearch is unreachable. Cross-entity searching across Posts, Books, and Projects.
  - ⚡ **Analytics Queue & Lifecycle Pruning**: Client-side memory queue buffering 5 events / 5s flushes (`keepalive` protection) with backend `createMany` bulk writes. Includes a 90-day rolling data prune CLI script with persistent baseline accumulation.
- **Full-Featured Admin Dashboard**:
  - 14 modular admin views covering posts, bilingual categories, comment moderation, link health checks, book editions, AI summary tuning, R2 attachments, analytics charts, and global settings.
- **Internationalization & Modern Tooling**:
  - **Next-Intl**: Seamless English and Chinese (`zh-CN` / `en-US`) dual-locale routing with `as-needed` path prefixes.
  - **Toolchain**: Turborepo 2 + pnpm workspaces + Biome 2 (ultra-fast linting & formatting) + Vitest 4 (unit testing).

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **PostgreSQL** >= 16
- **Redis** >= 7 (Optional, for caching and queues)
- **MeiliSearch** (Recommended, for instant full-text search; bundled in Docker)
- **Python** >= 3.11 (Optional, for running the AI Trending ingestion worker under `schedule/`)
- **Cloudflare R2** (Optional / Recommended for production asset storage)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rick-hayek/voocii-portal.git
cd portal
```

### 2. Install dependencies

This project uses `pnpm` as the package manager:

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` is set to your PostgreSQL instance. Configure `ADMIN_API_KEY`, `MEILISEARCH_*`, `R2_*`, and email credentials as needed for external integrations.

### 4. Start Local Infrastructure (Docker)

Launch PostgreSQL 16, Redis 7, and MeiliSearch with a single command:

```bash
docker compose up -d
```

### 5. Database Initialization & Migrations

#### For Local Development
Execute all version-controlled Prisma SQL migration scripts:

```bash
pnpm --filter @portal/db migrate:dev
```

#### For Production Deployment
Safely apply incremental migrations to your production database without resetting data:

```bash
pnpm --filter @portal/db migrate:deploy
```

> [!NOTE]
> All database structural changes and version history are tracked in `packages/db/prisma/migrations/`.

(Optional) Seed the database with initial demo data:

```bash
pnpm --filter @portal/db seed
```

### 6. Run the Development Server

Start the Turborepo full-stack development server:

```bash
pnpm dev
```

- **Main Web Application**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin` (Accessible by authenticated users with the `admin` role)
- **REST API Endpoint**: `http://localhost:3000/api/v1`
- **LLM Knowledge Base**: `http://localhost:3000/llms.txt`

### 7. Common Development & Maintenance Scripts

```bash
# Open visual database editor (Prisma Studio, default http://localhost:5555)
pnpm --filter @portal/db studio

# Run automated test suites (Vitest)
pnpm test

# Lint and auto-fix code formatting (Biome)
pnpm lint
pnpm lint:fix

# Run 90-day rolling analytics prune & archival
pnpm db:prune-analytics --days=90
```

---

## Project Structure

This project is organized as a Turborepo Monorepo:

```
portal/
├── apps/
│   └── web/            # Next.js 16 full-stack web application (site, admin, and /api routes)
├── packages/
│   ├── api/            # tRPC routers, EmailService, R2 client, and search bridge
│   ├── db/             # Prisma schema (21 models), singleton client, and database scripts
│   ├── theme/          # 6 modern theme presets, ThemeProvider, and runtime CSS injection
│   ├── config/         # Zod schemas, 5 preset configurations, and central module registry
│   └── shared/         # Shared TypeScript interfaces, types, and utility helpers
├── schedule/           # Python background worker for weekly AI Trending ingestion & LLM summaries
│   ├── fetch_trending.py
│   └── run.sh
└── documents/          # Architecture specs (architecture-v1.md), REST API specs, and guides
```

---

## Site Configuration & Presets

All site behavior and module combinations are declaratively defined in [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts):

```ts
import { defaultAboutConfig, defineConfig } from '@portal/config';

const siteConfig = defineConfig({
  site: {
    title: 'Voocii',
    description: 'A modular personal website platform',
    url: 'https://voocii.com',
    locale: 'zh-CN',
    author: 'Rick',
  },

  // 1. Out-of-the-box presets: 'minimal' | 'tech-blog' | 'creative' | 'devtools' | 'full'
  preset: 'full',

  // 2. Theme engine configuration
  theme: {
    default: 'zenith',
    available: ['zenith', 'lumiere', 'dark-neon', 'cyberpunk', 'retro-brown', 'minimal-light'],
    allowUserSwitch: true,
  },

  // 3. Homepage layout dispatch: 'classic' | 'metro'
  homeLayout: 'classic',

  // 4. Comment moderation policy
  comments: {
    requireModeration: false, // If true, comments require admin approval before becoming public
  },

  // 5. Multi-avatar service URL template (supports WeAvatar, Cravatar, Gravatar, DiceBear)
  avatar: {
    urlTemplate: 'https://weavatar.com/avatar/{hash}?d=initials&name={name}',
  },

  // 6. Transactional email notification service
  email: {
    enabled: true,
    provider: 'mailgun', // 'mailgun' | 'sendgrid' | 'smtp' | 'resend'
  },

  // 7. Structured about/bio configuration
  about: defaultAboutConfig,
});

export default siteConfig;
```

---

## Layout Configuration & Extensibility

### 1. Homepage Layout Selection (`homeLayout`)
Switch between built-in layouts by toggling `homeLayout` in `site.config.ts`:
- `'classic'`: Traditional responsive flow layout with clean hero introduction, post feed, and project cards.
- `'metro'`: Microsoft Metro grid tile layout (Tessellate Noir high-contrast block design).

### 2. Adding Custom Layouts
The platform uses a Layout Factory Registry with `next/dynamic` code splitting:
1. Create your layout component in [`apps/web/src/components/home/layouts/`](apps/web/src/components/home/layouts/) (e.g. `BentoLayout.tsx`).
2. Register it in [`apps/web/src/components/home/layouts/index.ts`](apps/web/src/components/home/layouts/index.ts) using `next/dynamic`.
3. Set the key in `site.config.ts`. Unused layouts automatically incur zero client bundle overhead.

---

## Deployment

### 1. Pre-Deployment Configuration
Before deploying to production, ensure `site.url` in `site.config.ts` is updated to your live domain. This is required for:
- **Search Engine Indexing**: Canonical URLs generated in `sitemap.xml` and `robots.txt`.
- **Social Cards**: Open Graph and Twitter Card preview images and links.
- **RSS & LLM Endpoints**: Standard URLs in `/feed.xml`, `/llms.txt`, and raw Markdown endpoints.

### 2. Vercel Deployment & Automatic Migrations
This repository is optimized for Vercel. We recommend configuring the **Build Command** in your Vercel project settings to run database migrations automatically before every build:

```bash
pnpm --filter @portal/db migrate:deploy && turbo build
```

This guarantees that database schemas are always up-to-date before compiling the application bundle.

---

## Architecture Documentation & Versioning

- **Latest Architecture Specification**: See [`documents/architecture-v1.md`](documents/architecture-v1.md).
- **REST API v1 Specification**: See [`documents/rest_api_v1_spec.md`](documents/rest_api_v1_spec.md).
- **Versioning Policy**: This project follows [Semantic Versioning (SemVer)](https://semver.org/). Release notes and historical changes are tracked in [`CHANGELOG.md`](CHANGELOG.md).

---

## License

[MIT License](LICENSE)
