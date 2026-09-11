import type { Metadata } from 'next';

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
  // Normalize pathname: ensure it starts with / (unless empty string) and has no trailing slash
  let cleanPath = pathname.trim();
  if (cleanPath && !cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  if (cleanPath === '/') {
    cleanPath = '';
  }

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
