import { prisma } from '@portal/db';
import siteConfig from '@/site.config';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = siteConfig.site.url.replace(/\/+$/, '');
  const authorName = siteConfig.site.author || 'Rick';

  const [posts, projects, about] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 25,
      select: { slug: true, title: true, excerpt: true },
    }),
    prisma.project.findMany({
      select: {
        slug: true,
        title: true,
        description: true,
        techStack: true,
      },
    }),
    prisma.aboutInfo.findUnique({
      where: { id: 'default' },
    }),
  ]);

  const authorBio =
    (about?.author as any)?.description || siteConfig.site.description;

  const lines = [
    `# ${siteConfig.site.title}`,
    '',
    `> ${siteConfig.site.description}. Created and maintained by ${authorName}.`,
    '',
    authorBio,
    '',
    '## Core Navigation & Sections',
    `- [About Me](${baseUrl}/about): Developer background, experience, tech stack, and social links.`,
    `- [Blog](${baseUrl}/blog): Technical articles, system architecture, and thoughts on software engineering.`,
    `- [Portfolio](${baseUrl}/portfolio): Showcase of open-source projects, SaaS products, and development tools.`,
    `- [Reading List](${baseUrl}/books): Curated books on computer science, economics, philosophy, and reviews.`,
    `- [AI Trending](${baseUrl}/trending): Weekly trending open-source AI & LLM GitHub repositories with automated summaries.`,
    `- [Developer Tools](${baseUrl}/tools): Online utilities including JSON Formatter, Base64, JWT Decoder, Markdown Editor, QR Code, and HTTP Client.`,
    `- [RSS Feed](${baseUrl}/feed.xml): Full-content RSS 2.0 feed for automated ingestion and feed readers.`,
    '',
    '## Featured Projects',
    ...projects.map((p) => {
      const stack = p.techStack?.length ? ` (${p.techStack.join(', ')})` : '';
      return `- [${p.title}](${baseUrl}/portfolio/${p.slug})${stack}: ${p.description || 'Project details and architecture.'}`;
    }),
    '',
    '## Recent Articles (with Clean Markdown Endpoints)',
    ...posts.map((p) => {
      const desc = p.excerpt ? `: ${p.excerpt}` : '';
      return `- [${p.title}](${baseUrl}/blog/${p.slug})${desc} (Raw: ${baseUrl}/blog/${p.slug}.md)`;
    }),
    '',
    '## Developer Tools',
    `- [JSON Formatter](${baseUrl}/tools/json-formatter): Format, validate, and minify JSON data.`,
    `- [Base64 Converter](${baseUrl}/tools/base64): Encode and decode Base64 strings.`,
    `- [JWT Decoder](${baseUrl}/tools/jwt-decoder): Inspect and decode JSON Web Token headers and payloads.`,
    `- [Markdown Editor](${baseUrl}/tools/markdown-editor): Live split-screen Markdown preview with syntax highlighting.`,
    `- [QR Code Generator](${baseUrl}/tools/qrcode): Create and customize QR codes with logos and colors.`,
    `- [HTTP Client](${baseUrl}/tools/http-client): Test HTTP APIs with custom headers, query params, and body.`,
    '',
    '## Optional & Full Documentation',
    `- [Full Site Knowledge Corpus (llms-full.txt)](${baseUrl}/llms-full.txt): Complete articles, project architectures, and reading notes in a single LLM-optimized document.`,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
