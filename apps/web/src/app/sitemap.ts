import { prisma } from '@portal/db';
import type { MetadataRoute } from 'next';
import siteConfig from '../site.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.site.url.replace(/\/+$/, '');

  // Complete static routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/portfolio',
    '/trending',
    '/books',
    '/resume',
    '/gallery',
    '/guestbook',
    '/links',
    '/tools',
    '/tools/base64',
    '/tools/json-formatter',
    '/tools/jwt-decoder',
    '/tools/markdown-editor',
    '/tools/qrcode',
    '/tools/http-client',
  ];

  // Fetch dynamic content from database
  const [posts, projects, books] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.project.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.book.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  const addRoute = (
    route: string,
    options: {
      lastModified?: Date;
      changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    } = {},
  ) => {
    const cleanRoute =
      route === '' || route === '/' ? '' : route.startsWith('/') ? route : `/${route}`;
    const zhUrl = cleanRoute ? `${baseUrl}${cleanRoute}` : baseUrl;
    const enUrl = `${baseUrl}/en${cleanRoute}`;

    const alternates = {
      languages: {
        zh: zhUrl,
        en: enUrl,
        'x-default': zhUrl,
      },
    };

    // Add entry for default (zh, without /zh prefix)
    sitemapEntries.push({
      url: zhUrl,
      lastModified: options.lastModified ?? new Date(),
      changeFrequency: options.changeFrequency ?? 'weekly',
      priority: options.priority ?? 0.8,
      alternates,
    });

    // Add entry for English (/en prefix)
    sitemapEntries.push({
      url: enUrl,
      lastModified: options.lastModified ?? new Date(),
      changeFrequency: options.changeFrequency ?? 'weekly',
      priority: options.priority ?? 0.8,
      alternates,
    });
  };

  // 1. Static routes
  for (const route of staticRoutes) {
    addRoute(route, {
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: route === '' ? 1.0 : 0.8,
    });
  }

  // 2. Blog posts
  for (const post of posts) {
    addRoute(`/blog/${post.slug}`, {
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 3. Portfolio projects
  for (const project of projects) {
    addRoute(`/portfolio/${project.slug}`, {
      lastModified: project.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 4. Books
  for (const book of books) {
    addRoute(`/books/${book.slug}`, {
      lastModified: book.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return sitemapEntries;
}
