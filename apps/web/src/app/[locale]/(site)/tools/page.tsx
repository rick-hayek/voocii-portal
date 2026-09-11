import { FileJson, FileText, Hash, QrCode, Send, Settings2, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAlternates } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  return {
    title: tNav('tools'),
    alternates: getAlternates('/tools', locale),
  };
}

export default function ToolsPage() {
  const t = useTranslations('Tools');

  const tools = [
    {
      id: 'http-client',
      name: t('httpClient.name'),
      description: t('httpClient.desc'),
      icon: <Send className="h-6 w-6" />,
      href: '/tools/http-client',
      color: 'text-sky-500',
      bg: 'bg-[rgba(14,165,233,0.1)]',
    },
    {
      id: 'markdown-editor',
      name: t('markdownEditor.name'),
      description: t('markdownEditor.desc'),
      icon: <FileText className="h-6 w-6" />,
      href: '/tools/markdown-editor',
      color: 'text-emerald-500',
      bg: 'bg-[rgba(16,185,129,0.1)]',
    },
    {
      id: 'json-formatter',
      name: t('jsonFormatter.name'),
      description: t('jsonFormatter.desc'),
      icon: <FileJson className="h-6 w-6" />,
      href: '/tools/json-formatter',
      color: 'text-blue-500',
      bg: 'bg-[rgba(59,130,246,0.1)]',
    },
    {
      id: 'base64',
      name: t('base64.name'),
      description: t('base64.desc'),
      icon: <Hash className="h-6 w-6" />,
      href: '/tools/base64',
      color: 'text-purple-500',
      bg: 'bg-[rgba(168,85,247,0.1)]',
    },
    {
      id: 'jwt-decoder',
      name: t('jwt.name'),
      description: t('jwt.desc'),
      icon: <Shield className="h-6 w-6" />,
      href: '/tools/jwt-decoder',
      color: 'text-orange-500',
      bg: 'bg-[rgba(249,115,22,0.1)]',
    },
    {
      id: 'qrcode',
      name: t('qrcode.name'),
      description: t('qrcode.desc'),
      icon: <QrCode className="h-6 w-6" />,
      href: '/tools/qrcode',
      color: 'text-violet-500',
      bg: 'bg-[rgba(139,92,246,0.1)]',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 pt-8 sm:pt-12">
      <header className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]">
            <Settings2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-color-text)] sm:text-4xl md:text-5xl">
            {t('title')}
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-xs sm:text-base text-[var(--portal-color-text-secondary)]">
          {t('description')}
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group relative flex flex-row items-start gap-4 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4 sm:p-6 transition-all hover:-translate-y-1 hover:border-[var(--portal-color-primary)] hover:shadow-lg hover:shadow-[0_8px_30px_rgba(107,142,201,0.05)]"
          >
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${tool.bg} ${tool.color} transition-transform group-hover:scale-110`}
            >
              {tool.icon}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold leading-snug tracking-tight text-[var(--portal-color-text)]">
                {tool.name}
              </h3>
              <p className="line-clamp-2 text-xs sm:text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
