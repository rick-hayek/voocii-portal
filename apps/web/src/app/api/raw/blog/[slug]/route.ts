import { prisma } from '@portal/db';
import siteConfig from '@/site.config';

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: 'published' },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  if (!post) {
    return new Response('Not Found', { status: 404 });
  }

  const tagsList = post.tags.map((t) => `"${t.tag.name}"`).join(', ');
  const authorName = post.author?.name || siteConfig.site.author || 'Rick';
  const canonicalUrl = `${siteConfig.site.url}/blog/${post.slug}`;

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `slug: ${post.slug}`,
    `author: ${JSON.stringify(authorName)}`,
    post.publishedAt ? `publishedAt: "${post.publishedAt.toISOString()}"` : null,
    post.updatedAt ? `updatedAt: "${post.updatedAt.toISOString()}"` : null,
    post.category ? `category: ${JSON.stringify(post.category.name)}` : null,
    post.tags.length > 0 ? `tags: [${tagsList}]` : null,
    `canonical: ${canonicalUrl}`,
    '---',
    '',
    post.content,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return new Response(frontmatter, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
