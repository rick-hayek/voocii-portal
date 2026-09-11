# Voocii Portal ![Version](https://img.shields.io/badge/version-v1.0.7-blue.svg)

基于 Next.js 16、tRPC、Prisma 与 Tailwind CSS v4 构建的现代全栈个人门户网站与作品集平台。

[English](./README.en.md) | 中文

## 布局

经典:

![Classic Homepage](./designs/screenshot/voocii-classic-zh.png)

Metro:

![Metro Homepage](./designs/screenshot/voocii-metro-zh.png)


## 特性

- **Next.js 16 App Router**：充分利用最新的 React 特性与服务端组件 (RSC)。
- **动态多布局引擎 (Dynamic Multi-Layout Engine)**：支持经典自适应流式与极客网格等多种首页布局。
- **tRPC**：端到端类型安全的 API 接口。
- **Prisma ORM**：结合 PostgreSQL 的类型安全数据库访问。
- **Tailwind CSS v4**：基于现代设计系统的原子化样式。
- **Next-Intl**：完善的英文与中文国际化 (i18n) 支持。
- **主题引擎 (Theme Engine)**：内置暗黑模式与多种预设主题。
- **Monorepo 架构**：基于 Turborepo 和 pnpm workspaces 统一管理。
- **模块化设计**：包含博客、作品集、留言板、友链及开发者工具箱。
- **后台管理系统**：集成式的集中内容管理与数据统计。

## 环境要求

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 16
- Redis（可选，用于缓存）

## 快速上手

### 1. 克隆代码库

```bash
git clone https://github.com/rick-hayek/portal.git
cd portal
```

### 2. 安装依赖

本项目使用 `pnpm` 作为包管理器：

```bash
pnpm install
```

### 3. 配置环境变量

复制示例环境变量文件并填写您的配置：

```bash
cp .env.example .env
```

请确保将 `DATABASE_URL` 设置为您本地或远程的 PostgreSQL 实例地址。

### 4. 数据库初始化与迁移

使用 Docker 启动本地 PostgreSQL 数据库：
```bash
docker compose up -d
```

#### 本地开发环境
按时间顺序执行所有版本控制的 SQL 迁移脚本：

```bash
pnpm --filter @portal/db migrate:dev
```

#### 生产部署环境
安全地向生产数据库应用所有增量迁移（不会重置现有数据）：

```bash
pnpm --filter @portal/db migrate:deploy
```

> [!NOTE]
> 所有的数据库结构变更与版本历史均追踪于 `packages/db/prisma/migrations/`。运行迁移命令会自动按顺序应用每个 SQL 脚本。

（可选）导入初始种子数据：

```bash
pnpm --filter @portal/db seed
```

### 5. 启动开发服务器

启动跨包的 Turborepo 开发服务器：

```bash
pnpm dev
```

- 主应用访问地址：`http://localhost:3000`。
- **后台管理系统**访问地址：`/admin`（例如 `http://localhost:3000/admin`），仅具有 `admin` 角色的已登录用户可访问。

### 6. 数据库可视化管理 (Prisma Studio)

打开可视化数据库编辑器来管理用户、角色（例如将自己设为 `admin`）及内容记录：

```bash
pnpm --filter @portal/db studio
```

将在 `http://localhost:5555` 启动可视化 Web 界面。

## 项目结构

本项目基于 Turborepo Monorepo 架构构建：

- `apps/web`: Next.js 前端主应用。
- `packages/api`: tRPC 路由与 API 业务逻辑。
- `packages/db`: Prisma Schema 数据库客户端。
- `packages/theme`: 设计系统与主题配置包。
- `packages/config`: 共享站点配置文件与工具库。
- `packages/shared`: 共享 TypeScript 类型与常量。

## 布局配置与可扩展性

### 1. 首页布局切换 (`homeLayout`)

您可以在 [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts) 中轻松切换首页排版风格：

```ts
const siteConfig = defineConfig({
  // ...
  homeLayout: 'classic', // 内置选项: 'classic' | 'metro'
});
```

内置布局风格：
- `'classic'`：经典自适应流式排版（包含 Hero 介绍、文章列表与项目卡片网格）。
- `'metro'`：微软 Windows Metro 网格瓷砖排版（Tessellate Noir 极简高对比度块状设计）。

### 2. 布局的可扩展性 (扩展自定义布局)

系统采用了插件工厂与 Code-Splitting 动态切包的解耦架构，可以非常方便地添加新的自定义首页布局（如 `'bento'`、`'newspaper'`、`'minimal'` 等）：

1. **创建布局与 Header 组件**：
   - 在 [`apps/web/src/components/home/layouts/`](apps/web/src/components/home/layouts/) 创建 Layout 组件（例如 `BentoLayout.tsx`）。
   - 在 [`apps/web/src/components/layout/headers/`](apps/web/src/components/layout/headers/) 创建 Header 组件（例如 `BentoHeader.tsx`）。
2. **在注册中心配置动态加载**：
   - 在 [`apps/web/src/components/home/layouts/index.ts`](apps/web/src/components/home/layouts/index.ts) 中注册 Layout：
     ```ts
     bento: dynamic(() => import('./BentoLayout').then((m) => m.BentoLayout)),
     ```
   - 在 [`apps/web/src/components/layout/Header.tsx`](apps/web/src/components/layout/Header.tsx) 中注册 Header：
     ```ts
     bento: dynamic(() => import('./headers/BentoHeader').then((m) => m.BentoHeader)),
     ```
3. **注册配置选项**：
   在 [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts) 中将新布局 key 添加至 `homeLayout` 类型选项即可完成切换，未使用的布局与 Header 将通过 `next/dynamic` 自动实现客户端 0 Bundle 占用。

---

## 部署说明

### 1. 站点配置 (预部署)

在部署到生产环境之前，请更新 [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts) 中的域名及元数据信息：

```ts
const siteConfig = defineConfig({
  site: {
    title: '您的站点标题',
    description: '您的站点描述',
    url: 'https://your-domain.com', // 必须设置为您的实际生产域名
    locale: 'zh-CN',
  },
  // ...
});
```

> [!IMPORTANT]
> 将 `site.url` 设置为实际生产域名是以下功能正常运行的必要前提：
> - **SEO 与搜索引擎爬虫**：`sitemap.xml` 和 `robots.txt` 中生成的 Standard 规范 URL。
> - **社交分享**：分享页面时的 Open Graph 和 Twitter Card 预览卡片链接。
> - **RSS 订阅**：`/feed.xml` 中文章的规范链接。

### 2. Vercel 部署

本项目针对 Vercel 部署进行了全面优化。请确保在 Vercel 项目设置中配置了所有必需的环境变量。

### 3. 生产环境数据库迁移

当部署包含数据库 Schema 变更的更新时，必须将迁移应用到生产数据库。

#### 方案 1：手动迁移
在本地将 `DATABASE_URL` 环境变量设置为生产数据库地址后运行：
```bash
DATABASE_URL="your-production-database-url" pnpm --filter @portal/db migrate:deploy
```

#### 方案 2：Vercel 自动构建步骤 (推荐)
在 Vercel 项目设置的 **Build Command** 中配置在每次构建前自动运行数据库迁移：
```bash
pnpm --filter @portal/db migrate:deploy && turbo build
```
这可确保在编译和提供新版本之前，数据库结构始终是最新的。

## 版本管理与更新日志

本项目严格遵循 [语义化版本规范 (Semantic Versioning - SemVer)](https://semver.org/lang/zh-CN/)：
- **主版本号 (`X.0.0`)**：包含不兼容的破坏性 API 变更或重大架构重构。
- **次版本号 (`0.X.0`)**：包含向下兼容的功能模块新增、新布局 preset 或非破坏性 API 扩展。
- **修订号 (`0.0.X`)**：包含向下兼容的 Bug 修复、性能优化或样式微调。

所有版本的发布记录、详细特性更新及重大变更说明均完整维护于 [`CHANGELOG.md`](CHANGELOG.md) 中。

## 开源协议

MIT
