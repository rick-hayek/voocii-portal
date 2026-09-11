import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { AdSense } from '@/components/blog/AdSense';
import { CommentSection } from '@/components/blog/CommentSection';
import { CustomBlockquote } from '@/components/blog/CustomBlockquote';
import { MathRenderer } from '@/components/blog/MathRenderer';
import { MermaidRenderer } from '@/components/blog/MermaidRenderer';
import { SafeMDXRemote } from '@/components/blog/SafeMDXRemote';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { getCategoryName } from '@/lib/category';
import rehypeCustomHighlight from '@/lib/rehype-custom-highlight';
import {
  generateBreadcrumbSchema,
  getAbsoluteImageUrl,
  getAlternates,
  getCanonicalUrl,
} from '@/lib/seo';
import { extractTocItems } from '@/lib/toc';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';

export const revalidate = 3600; // revalidate at most every hour (ISR)

export async function generateStaticParams() {
  const trpc = await getTRPCServer();
  // Pre-render the first 50 posts
  const data = await trpc.post.list({ page: 1, limit: 50 });
  const locales = ['en', 'zh'];

  return locales.flatMap((locale) =>
    data.posts.map((post) => ({
      locale,
      slug: post.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const trpc = await getTRPCServer();
  const post = await trpc.post.bySlug({ slug });
  if (!post) return { title: 'Not Found' };

  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  const title = `${post.title} | ${tNav('blog')}`;
  const description = post.excerpt ?? '';
  const canonicalUrl = getCanonicalUrl(`/blog/${slug}`, locale);
  const coverImageUrl = getAbsoluteImageUrl(post.coverImage);
  const authorName = post.author?.name || siteConfig.site.author || 'Rick';

  return {
    title,
    description,
    alternates: getAlternates(`/blog/${slug}`, locale),
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.site.title,
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: [authorName],
      tags: post.tags?.map((t) => t.tag.name) ?? [],
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: coverImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Set request locale for static/ISR rendering in next-intl
  setRequestLocale(locale);

  const trpc = await getTRPCServer();
  const post = await trpc.post.bySlug({ slug });
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'Navigation' });
  const hasToc = extractTocItems(post.content).length > 0;

  const authorName = post.author.name || siteConfig.site.author || 'Rick';
  const canonicalUrl = getCanonicalUrl(`/blog/${post.slug}`, locale);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: {
      '@type': 'Person',
      name: authorName,
      image: post.author.image || '',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.site.title,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.site.url}/icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t('home'), url: getCanonicalUrl('', locale) },
    { name: t('blog'), url: getCanonicalUrl('/blog', locale) },
    { name: post.title, url: canonicalUrl },
  ]);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8 mx-auto w-full max-w-[1536px]">
      {/* Load KaTeX stylesheet and core JS script from CDN to avoid compiling local assets */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css"
        integrity="sha384-vlBdW0r3AcZO/HboRPznQNowvexd3fY8qHOWkBi5q7KGgqJ+F48+DceybYmrVbmB"
        crossOrigin="anonymous"
      />
      <script
        defer
        src="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.js"
        crossOrigin="anonymous"
      />
      {/* Load Highlight.js atom-one-dark stylesheet from CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Symmetrical 3-Column Layout: Left Balance Spacer + Centered Article + Right TOC */}
      <div className="flex justify-center items-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
        {/* Left Empty Balance Spacer (Desktop ≥ 1250px, only if hasToc) */}
        {hasToc && (
          <div
            className="hidden min-[1250px]:block shrink w-[180px] xl:w-[220px] 2xl:w-[260px] min-w-[160px] max-w-[260px]"
            aria-hidden="true"
          />
        )}

        {/* Main Article Content */}
        <article className="w-full max-w-3xl shrink min-w-0">
          {/* Header */}
          <header className="mb-8">
            <h1 className="mb-5 text-3xl font-bold leading-tight text-[var(--portal-color-text)] sm:text-4xl">
              {post.title}
            </h1>

            {/* Author & Post Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--portal-color-text-secondary)]">
              {post.category && (
                <a
                  href={`/blog?category=${post.category.slug}`}
                  className="rounded-full bg-[var(--portal-color-primary)] px-2.5 py-0.5 text-xs text-white hover:opacity-90 transition-opacity"
                >
                  {getCategoryName(post.category, locale)}
                </a>
              )}

              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name ?? ''}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-[var(--portal-color-text)]">
                {post.author.name}
              </span>

              {post.publishedAt && (
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {new Date(post.publishedAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}

              {typeof post.views === 'number' && (
                <span className="flex items-center gap-1.5 opacity-85">
                  <span>·</span>
                  <span>{post.views.toLocaleString()} {locale === 'zh' ? '次阅读' : 'views'}</span>
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <a
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="rounded-md border border-[var(--portal-color-border)] px-2 py-0.5 text-xs text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]"
                  >
                    #{tag.name}
                  </a>
                ))}
              </div>
            )}
          </header>

          {/* Markdown Content */}
          <div className="prose prose-portal max-w-none">
            <SafeMDXRemote
              source={post.content}
              components={{
                AdSense,
                blockquote: CustomBlockquote,
              }}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm, remarkMath],
                  rehypePlugins: [rehypeCustomHighlight, rehypeSlug],
                },
              }}
            />
          </div>

          {/* Comments */}
          <CommentSection postId={post.id} comments={post.comments} />

          {/* Client-Side LaTeX & Mermaid Diagram triggers */}
          <MathRenderer />
          <MermaidRenderer />
        </article>

        {/* Right Sidebar - Sticky Table of Contents (Desktop Only, only if hasToc) */}
        {hasToc && (
          <aside className="hidden lg:block shrink w-[180px] xl:w-[220px] 2xl:w-[260px] min-w-[160px] max-w-[260px] sticky top-24">
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TableOfContents content={post.content} title={t('tableOfContents')} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
