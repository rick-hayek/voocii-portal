import { getTranslations } from 'next-intl/server';
import type React from 'react';
import { getAlternates } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  return {
    title: tNav('resume'),
    alternates: getAlternates('/resume', locale),
  };
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
