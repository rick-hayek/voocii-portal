import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Updated Prisma schema bindings
const nextConfig: NextConfig = {
  output: 'standalone',
  // Resolve pnpm workspace + subpath exports for Turbopack
  serverExternalPackages: ['@trpc/server'],
  transpilePackages: [
    '@portal/api',
    '@portal/config',
    '@portal/db',
    '@portal/shared',
    '@portal/theme',
  ],
  async rewrites() {
    return [
      {
        source: '/feed.xml',
        destination: '/api/feed.xml',
      },
      {
        source: '/rss.xml',
        destination: '/api/feed.xml',
      },
      {
        source: '/blog/:slug.md',
        destination: '/api/raw/blog/:slug',
      },
      {
        source: '/:locale(zh|en)/blog/:slug.md',
        destination: '/api/raw/blog/:slug',
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'rick-hayek.github.io' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'pub-8e6d28a4f57a48539e93d60d9359e729.r2.dev' },
    ],
  },
};

export default withNextIntl(nextConfig);
