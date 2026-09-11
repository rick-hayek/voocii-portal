import { getTranslations } from 'next-intl/server';
import type React from 'react';
import { getAlternates } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  const tTools = await getTranslations({ locale, namespace: 'Tools' });
  return {
    title: `${tTools('qrcode.name')} | ${tNav('tools')}`,
    alternates: getAlternates('/tools/qrcode', locale),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
