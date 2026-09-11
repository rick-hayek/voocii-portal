import type { Metadata } from 'next';
import siteConfig from '@/site.config';

/**
 * Normalizes a relative path ensuring a leading slash and no trailing slash.
 */
function normalizePath(pathname: string): string {
  let cleanPath = pathname.trim();
  if (cleanPath && !cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  if (cleanPath === '/') {
    cleanPath = '';
  }
  return cleanPath;
}

/**
 * Returns the absolute canonical URL for a given pathname and locale.
 */
export function getCanonicalUrl(pathname: string, currentLocale: string): string {
  const cleanPath = normalizePath(pathname);
  const baseUrl = siteConfig.site.url.replace(/\/+$/, '');
  const relativePath = currentLocale === 'en' ? `/en${cleanPath}` : cleanPath || '/';
  return relativePath === '/' ? baseUrl : `${baseUrl}${relativePath}`;
}

/**
 * Generates canonical and alternate (hreflang) URLs matching the routing configuration:
 * - defaultLocale: 'zh' with localePrefix: 'as-needed'
 * - Chinese pages: '/' or '/about' (no /zh prefix)
 * - English pages: '/en' or '/en/about'
 */
export function getAlternates(
  pathname: string,
  currentLocale: string,
): NonNullable<Metadata['alternates']> {
  const cleanPath = normalizePath(pathname);
  const zhPath = cleanPath || '/';
  const enPath = `/en${cleanPath}`;

  const canonical = currentLocale === 'en' ? enPath : zhPath;

  return {
    canonical,
    languages: {
      zh: zhPath,
      en: enPath,
      'x-default': zhPath,
    },
  };
}

/**
 * Resolves an image URL to an absolute URL suitable for OpenGraph and Twitter tags.
 */
export function getAbsoluteImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const baseUrl = siteConfig.site.url.replace(/\/+$/, '');
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

