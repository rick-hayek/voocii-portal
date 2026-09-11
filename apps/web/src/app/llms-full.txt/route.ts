import { prisma } from '@portal/db';
import siteConfig from '@/site.config';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = siteConfig.site.url.replace(/\/+$/, '');
  const authorName = siteConfig.site.author || 'Rick';

  const [posts, projects, books, about] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    }),
    prisma.project.findMany({
      select: {
        slug: true,
        title: true,
        description: true,
        techStack: true,
        liveUrl: true,
        repoUrl: true,
      },
    }),
    prisma.book.findMany({
      select: {
        slug: true,
        title: true,
        author: true,
        publisher: true,
        description: true,
        review: true,
      },
    }),
    prisma.aboutInfo.findUnique({
      where: { id: 'default' },
    }),
  ]);

  const authorObj = about?.author as any;
  const authorBio = authorObj?.description || siteConfig.site.description;
  const authorRole = authorObj?.role || 'Full-Stack Engineer';
  const authorStack = Array.isArray(authorObj?.stack)
    ? authorObj.stack.join(', ')
    : authorObj?.stack || 'Next.js, TypeScript, tRPC, Prisma, Python, AI Agent';

  const sections: string[] = [
    `# ${siteConfig.site.title} — Full Knowledge Corpus`,
    '',
    `> Comprehensive aggregated knowledge base for ${siteConfig.site.title} (${baseUrl}). Optimized for LLM RAG ingestion and contextual question answering.`,
    '',
    '---',
    '',
    '## Author Profile',
    `- Name: ${authorName}`,
    `- Role: ${authorRole}`,
    `- Core Stack: ${authorStack}`,
    `- Website: ${baseUrl}`,
    `- Bio: ${authorBio}`,
    '',
    '---',
    '',
    '## Projects Portfolio',
    '',
  ];

  for (const project of projects) {
    sections.push(
      `### ${project.title}`,
      `- URL: ${baseUrl}/portfolio/${project.slug}`,
      project.techStack?.length ? `- Stack: ${project.techStack.join(', ')}` : '',
      project.liveUrl ? `- Live: ${project.liveUrl}` : '',
      project.repoUrl ? `- Repository: ${project.repoUrl}` : '',
      '',
      project.description || '',
      '',
    );
  }

  sections.push('---', '', '## Technical Articles & Blog Posts', '');

  for (const post of posts) {
    const tags = post.tags.map((t) => t.tag.name).join(', ');
    sections.push(
      `### ${post.title}`,
      `- URL: ${baseUrl}/blog/${post.slug}`,
      `- Raw Markdown: ${baseUrl}/blog/${post.slug}.md`,
      post.publishedAt ? `- Published: ${post.publishedAt.toISOString().slice(0, 10)}` : '',
      post.category ? `- Category: ${post.category.name}` : '',
      tags ? `- Tags: ${tags}` : '',
      post.excerpt ? `- Summary: ${post.excerpt}` : '',
      '',
      post.content,
      '',
      '---',
      '',
    );
  }

  if (books.length > 0) {
    sections.push('## Recommended Reading List & Reviews', '');
    for (const book of books) {
      sections.push(
        `### ${book.title} (by ${book.author})`,
        `- URL: ${baseUrl}/books/${book.slug}`,
        book.publisher ? `- Publisher: ${book.publisher}` : '',
        book.review ? `**Review & Takeaways**: ${book.review}` : '',
        book.description ? book.description : '',
        '',
      );
    }
  }

  return new Response(sections.filter(Boolean).join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
