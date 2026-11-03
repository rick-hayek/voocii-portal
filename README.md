# Voocii Portal ![Version](https://img.shields.io/badge/version-v1.0.7-blue.svg)

基于 Next.js 16、tRPC v11、Prisma 与 Tailwind CSS v4 构建的现代全栈个人门户、知识库与作品集平台。

[English](./README.en.md) | 中文

---

## 布局预览

### 经典流式布局 (Classic)
![Classic Homepage](./designs/screenshot/voocii-classic-zh.png)

### 极客网格布局 (Metro Grid — Tessellate Noir)
![Metro Homepage](./designs/screenshot/voocii-metro-zh.png)

---

## 核心特性

- **现代全栈框架与运行时**：
  - **Next.js 16 App Router & Turbopack**：充分利用 React 19 服务端组件 (RSC) 与并发渲染。
  - **动态双首页布局引擎**：内置自适应流式 (`classic`) 与 Metro 磁贴网格 (`metro` / Tessellate Noir) 两套首页，服务端零水合分发，零布局抖动 (CLS = 0)。
  - **tRPC v11 & Prisma ORM**：端到端 100% 类型安全的 API 过程调用与强类型 PostgreSQL 访问。
  - **Tailwind CSS v4 & 高级主题引擎**：原生 CSS 变量驱动，内置 **6 套精心调校的现代预设主题**（`zenith` 默认、`lumiere` 杂志风、`dark-neon` 极客黑、`cyberpunk` 赛博朋克、`retro-brown` 复古书卷、`minimal-light` 极简透白），带服务端防白屏闪烁 (Anti-FOUC)。
- **丰富的内容与业务模块**：
  - 📝 **技术博客 (Blog)**：MDX 渲染、代码语法高亮、KaTeX 数学公式、Mermaid 图表，内置基于 `IntersectionObserver` 的**自动目录 (TOC)**（0% 滚动 CPU 占用），原生提供 **RSS 2.0 订阅** (`/api/feed.xml`) 与**独立文章阅读数统计**。
  - 📚 **图书阅读与书评 (Books)**：书单收录、ISBN/出版社、eBook 在线阅读直达、原著与译本自关联（`originalBook` $\leftrightarrow$ `translations`）及读者点赞/踩评价。
  - 🔥 **AI 趋势周报 (AI Trending)**：每周自动追踪 GitHub 热门 AI/LLM 开源项目，统计 Star 净增量，大模型自动生成中英双语摘要，历史按周归档。
  - 🎨 **作品集 (Portfolio)**：项目卡片网格、多端软件下载资产分发 (`downloadLinks`)、内置独立的双语《隐私政策》与《服务条款》子页面。
  - 🛠️ **开发者实用工具箱 (Tools)**：6 款纯前端与安全代理 Web 工具（Base64 编解码、JSON 格式化校验、JWT 解码、二维码生成、带 CORS 代理的 HTTP Client API 测试工具、Markdown 实时编辑器）。
  - 🔗 **友链与留言互动**：支持访客前台提交申请、IP 防刷限流、多源头像自动解析、三态审核流。
  - 📄 **在线简历 (Resume) & 🖼️ 瀑布流相册 (Gallery)**。
- **开放生态与 AI Agent 友好 (LLM Readiness)**：
  - 🔌 **开放 REST API v1 (`/api/v1`)**：基于 `ADMIN_API_KEY` 鉴权，原生桥接内部 tRPC 逻辑，专供外部自动化发布脚本与 MCP (Model Context Protocol) Agent。
  - 🤖 **原生 LLM 端点**：符合标准的 `/llms.txt`、`/llms-full.txt` 结构化知识库索引，以及每篇文章的纯文本 Markdown 获取端点 (`/api/raw/blog/[slug]`)。
- **事务型邮件通知服务 (Email Service)**：
  - 可插拔通道架构（内置支持 **Mailgun** 与 **SendGrid**，可扩展 SMTP/Resend）。
  - 实现友链审核通过、评论审核上线、收到回复自动向对应用户发送通知邮件。
- **高吞吐与容灾韧性架构**：
  - ☁️ **Cloudflare R2 对象存储**：大文件与媒体直传及全球 CDN 分发，彻底解耦关系型数据库 BLOB 存储。
  - 🔍 **双模容灾全站搜索**：高性能 MeiliSearch 全文索引，并在服务异常时**自动平滑降级至 PostgreSQL `ILIKE`** 模糊检索，跨文章、图书与作品联合检索。
  - ⚡ **访问统计与生命周期管理**：客户端 5 条 / 5 秒批处理上报（`keepalive` 容灾），后端 `createMany` 批量写入；支持 90 天数据滚动清理脚本与历史基线归档持久化。
- **全功能管理后台 (Admin Dashboard)**：
  - 14 个高度模块化的独立管理页面，覆盖文章、双语分类、评论审核、友链存活探测、图书版本关联、AI 摘要编辑、R2 附件管理、数据统计分析及全局配置。
- **国际化与工程规范**：
  - **Next-Intl 国际化**：英文与中文 (`zh-CN` / `en-US`) 双语体系，`as-needed` 智能路由前缀。
  - **现代工程管理**：Turborepo 2 + pnpm workspaces + Biome 2 (极速代码检查与格式化) + Vitest 4 (单元测试)。

---

## 环境要求

- **Node.js** >= 20
- **pnpm** >= 9
- **PostgreSQL** >= 16
- **Redis** >= 7（可选，用于缓存与辅助队列）
- **MeiliSearch**（推荐，用于即时全文搜索，Docker 默认包含）
- **Python** >= 3.11（可选，用于运行 `schedule/` 目录下的 GitHub AI 趋势爬取微任务）
- **Cloudflare R2**（可选/生产推荐，用于附件直传与媒体存储）

---

## 快速上手

### 1. 克隆代码库

```bash
git clone https://github.com/rick-hayek/voocii-portal.git
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

请确保配置 `DATABASE_URL`，如需使用外部功能可按需配置 `ADMIN_API_KEY`、`MEILISEARCH_*`、`R2_*` 及邮件服务密钥。

### 4. 启动本地基础设施 (Docker)

使用 Docker 一键启动本地配套服务（PostgreSQL 16、Redis 7、MeiliSearch）：

```bash
docker compose up -d
```

### 5. 数据库初始化与迁移

#### 本地开发环境
执行所有版本控制的 Prisma SQL 迁移脚本：

```bash
pnpm --filter @portal/db migrate:dev
```

#### 生产部署环境
安全地向生产数据库应用所有增量迁移（不会重置现有数据）：

```bash
pnpm --filter @portal/db migrate:deploy
```

> [!NOTE]
> 所有的数据库结构变更与版本历史均追踪于 `packages/db/prisma/migrations/`。

（可选）导入初始演示种子数据：

```bash
pnpm --filter @portal/db seed
```

### 6. 启动开发服务器

启动 Turborepo 全栈开发服务器：

```bash
pnpm dev
```

- **主门户应用**：`http://localhost:3000`
- **管理后台**：`http://localhost:3000/admin`（仅具有 `admin` 角色的已登录用户可访问）
- **REST API 端点**：`http://localhost:3000/api/v1`
- **LLM 知识库端点**：`http://localhost:3000/llms.txt`

### 7. 常用开发与维护命令

```bash
# 打开数据库可视化编辑器 (Prisma Studio, 默认 http://localhost:5555)
pnpm --filter @portal/db studio

# 运行自动化单元测试 (Vitest)
pnpm test

# 代码风格检查与自动修复 (Biome)
pnpm lint
pnpm lint:fix

# 执行访问日志 90 天滚动归档与清理
pnpm db:prune-analytics --days=90
```

---

## 项目结构

本项目基于 Turborepo Monorepo 架构组织：

```
portal/
├── apps/
│   └── web/            # Next.js 16 前端全栈主应用 (前台页面、后台管理、/api 路由)
├── packages/
│   ├── api/            # tRPC 业务路由、邮件服务 (EmailService)、R2 工具、搜索桥接
│   ├── db/             # Prisma Schema 21 个数据模型、Client 单例与数据维护脚本
│   ├── theme/          # 6 套现代预设主题、ThemeProvider 与运行时样式注入
│   ├── config/         # 站点配置 Zod Schema、5 大预设组合与中央模块注册中心
│   └── shared/         # 前后端共享 TypeScript 类型、接口契约与通用工具库
├── schedule/           # 独立 Python 定时微任务 (GitHub AI 趋势抓取与大模型摘要生成)
│   ├── fetch_trending.py
│   └── run.sh
└── documents/          # 架构设计规范 (architecture-v1.md)、REST API 规范与维护指南
```

---

## 站点配置与预设系统

站点的所有全局表现均集中在 [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts) 中进行声明式定义：

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

  // 1. 开箱即用预设: 'minimal' | 'tech-blog' | 'creative' | 'devtools' | 'full'
  preset: 'full',

  // 2. 主题引擎配置
  theme: {
    default: 'zenith',
    available: ['zenith', 'lumiere', 'dark-neon', 'cyberpunk', 'retro-brown', 'minimal-light'],
    allowUserSwitch: true,
  },

  // 3. 首页布局切换: 'classic' (流式经典) | 'metro' (Tessellate Noir 网格)
  homeLayout: 'classic',

  // 4. 评论审核策略
  comments: {
    requireModeration: false, // 设为 true 则必须经管理员后台审核后公开
  },

  // 5. 多源头像代理占位符模板 (支持 WeAvatar / Cravatar / Gravatar / DiceBear 等)
  avatar: {
    urlTemplate: 'https://weavatar.com/avatar/{hash}?d=initials&name={name}',
  },

  // 6. 事务型邮件通知服务
  email: {
    enabled: true,
    provider: 'mailgun', // 'mailgun' | 'sendgrid' | 'smtp' | 'resend'
  },

  // 7. 关于我结构化履历
  about: defaultAboutConfig,
});

export default siteConfig;
```

---

## 首页布局与扩展性

### 1. 首页布局切换 (`homeLayout`)
您只需在 `site.config.ts` 中修改 `homeLayout` 选项即可即时生效：
- `'classic'`：经典流式排版（Hero 介绍、精选文章列表与项目卡片流）。
- `'metro'`：微软 Metro 网格瓷砖排版（Tessellate Noir 极简高对比度块状设计）。

### 2. 扩展自定义布局
系统采用布局工厂与 Code-Splitting 动态切包架构，扩展新布局极为简单：
1. 在 [`apps/web/src/components/home/layouts/`](apps/web/src/components/home/layouts/) 下创建布局组件（如 `BentoLayout.tsx`）。
2. 在 [`apps/web/src/components/home/layouts/index.ts`](apps/web/src/components/home/layouts/index.ts) 中通过 `next/dynamic` 注册。
3. 在 `site.config.ts` 中指定新布局键名，未使用的布局自动实现客户端零 Bundle 占用。

---

## 部署说明

### 1. 生产环境预部署检查
在部署至生产环境前，请务必在 `site.config.ts` 中将 `site.url` 配置为真实的生产域名。该地址直接决定以下功能的规范生成：
- **搜索引擎收录**：`sitemap.xml` 与 `robots.txt` 中的 Canonical 规范 URL。
- **社交分享卡片**：Open Graph 与 Twitter Card 预览图片与链接。
- **RSS 订阅与 LLM 索引**：`/feed.xml`、`/llms.txt` 与文章纯文本 Markdown 端点。

### 2. Vercel 部署与自动迁移
本项目针对 Vercel 部署进行了深度优化。推荐在 Vercel 项目设置中的 **Build Command** 配置自动迁移命令：

```bash
pnpm --filter @portal/db migrate:deploy && turbo build
```

可确保每次构建新版本时，生产数据库结构均自动安全应用最新迁移。

---

## 架构文档与版本说明

- **系统最新架构规范文档**：详见 [`documents/architecture-v1.md`](documents/architecture-v1.md)。
- **REST API v1 开放规范**：详见 [`documents/rest_api_v1_spec.md`](documents/rest_api_v1_spec.md)。
- **版本规范**：本项目遵循 [语义化版本规范 (SemVer)](https://semver.org/lang/zh-CN/)，版本更新履历完整记录于 [`CHANGELOG.md`](CHANGELOG.md) 中。

---

## 开源协议

[MIT License](LICENSE)
