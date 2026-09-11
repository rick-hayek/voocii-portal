import type { Metadata } from 'next';
import { IBM_Plex_Mono, Sora } from 'next/font/google';
import '../globals.css';
import { ThemeProvider, ThemeScript } from '@portal/theme';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '../../i18n/routing';
import { TRPCReactProvider } from '../../lib/api/client';
import siteConfig from '../../site.config';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.site.title,
    template: `%s | ${siteConfig.site.title}`,
  },
  description: siteConfig.site.description,
  metadataBase: new URL(siteConfig.site.url),
  openGraph: {
    title: siteConfig.site.title,
    description: siteConfig.site.description,
    url: siteConfig.site.url,
    siteName: siteConfig.site.title,
    locale: siteConfig.site.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.site.title,
    description: siteConfig.site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Set request locale for static/ISR rendering in next-intl
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript defaultTheme={siteConfig.theme.default || 'zenith'} />
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5960009177449604"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body className={`${sora.variable} ${plexMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <TRPCReactProvider>
            <ThemeProvider defaultTheme={siteConfig.theme.default || 'zenith'}>
              {children}
            </ThemeProvider>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
