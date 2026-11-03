import type { Prisma } from '@portal/db';
import { formatPostDate } from '@portal/shared';
import { useLocale } from 'next-intl';
import { getCategoryName } from '@/lib/category';

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    category: true;
    tags: {
      include: { tag: true };
    };
  };
}>;

export function PostCard({ post }: { post: PostWithRelations }) {
  const locale = useLocale();

  const formattedDate = post.publishedAt
    ? formatPostDate(post.publishedAt, locale)
    : '—';

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 md:grid-cols-[96px_1fr_auto] gap-2 md:gap-6 items-baseline text-inherit no-underline transition-all hover:bg-[rgba(107,142,201,0.05)] hover:border-transparent"
      style={{
        padding: '1.2rem 1rem',
        borderBottom: '1px solid var(--portal-color-border-soft)',
        borderRadius: 12,
      }}
    >
      {/* Desktop Date */}
      <span
        className="hidden md:inline font-mono text-[var(--portal-color-text-secondary)]"
        style={{ fontSize: '.72rem', whiteSpace: 'nowrap' }}
      >
        {formattedDate}
      </span>

      {/* Content */}
      <div className="w-full">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          {/* Mobile Date */}
          <span
            className="font-mono text-[var(--portal-color-text-secondary)] md:hidden"
            style={{ fontSize: '.72rem', whiteSpace: 'nowrap' }}
          >
            {formattedDate}
          </span>
          {post.category && (
            <span
              className="inline-block uppercase text-[var(--portal-color-primary)]"
              style={{
                fontSize: '.6rem',
                fontWeight: 600,
                letterSpacing: '.08em',
                padding: '.1rem .5rem',
                background: 'rgba(107,142,201,.08)',
                borderRadius: 6,
              }}
            >
              {getCategoryName(post.category, locale)}
            </span>
          )}
        </div>
        <div
          className="text-[var(--portal-color-text)]"
          style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-.02em' }}
        >
          {post.title}
        </div>
        {post.excerpt && (
          <div
            className="text-[var(--portal-color-text-secondary)]"
            style={{ fontSize: '.82rem', marginTop: '.2rem', lineHeight: 1.6 }}
          >
            {post.excerpt}
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="flex font-mono" style={{ gap: '.3rem', marginTop: '.4rem' }}>
            {post.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="border border-compat text-[var(--portal-color-text-secondary)]"
                style={{ fontSize: '.6rem', padding: '.1rem .35rem', borderRadius: 4 }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <span
        className="hidden md:inline text-[var(--portal-color-primary)] opacity-0 transition-all -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
        style={{ fontSize: 18 }}
      >
        →
      </span>
    </a>
  );
}
