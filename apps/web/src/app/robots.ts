import type { MetadataRoute } from 'next';
import siteConfig from '../site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/llms-full.txt', '/feed.xml'],
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/feed.xml', '/blog/'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteConfig.site.url}/sitemap.xml`,
  };
}
