import { z } from 'zod';

// ──────────────────────────────────────────────
// Zod Schema for SiteConfig
// ──────────────────────────────────────────────

export const moduleConfigSchema = z.object({ enabled: z.boolean() }).passthrough();

export const siteConfigSchema = z.object({
  site: z.object({
    title: z.string().min(1),
    description: z.string().default(''),
    url: z.string().url(),
    locale: z.string().default('en-US'),
    author: z.string().default('Rick').optional(),
  }),
  preset: z.enum(['minimal', 'tech-blog', 'creative', 'full', 'devtools']).optional(),
  modules: z.record(z.string(), moduleConfigSchema).default({}),
  theme: z
    .object({
      default: z.string().default('minimal-light'),
      available: z
        .array(z.string())
        .default(['minimal-light', 'dark-neon', 'cyberpunk', 'nature-green', 'retro-brown']),
      allowUserSwitch: z.boolean().default(true),
    })
    .default({
      default: 'minimal-light',
      available: ['minimal-light', 'dark-neon', 'cyberpunk', 'nature-green', 'retro-brown'],
      allowUserSwitch: true,
    }),
  homeLayout: z.enum(['classic', 'metro']).default('classic'),
  admin: z
    .object({
      enabled: z.boolean().default(false),
      basePath: z.string().default('/admin'),
    })
    .default({
      enabled: false,
      basePath: '/admin',
    }),
  email: z
    .object({
      enabled: z.boolean().default(false),
      provider: z.string().default('mailgun'),
    })
    .default({
      enabled: false,
      provider: 'mailgun',
    })
    .optional(),
  comments: z
    .object({
      requireModeration: z.boolean().default(true),
    })
    .default({
      requireModeration: true,
    })
    .optional(),
  avatar: z
    .object({
      urlTemplate: z
        .string()
        .default('https://cravatar.cn/avatar/{hash}?d={fallback}&s={size}'),
    })
    .default({
      urlTemplate: 'https://cravatar.cn/avatar/{hash}?d={fallback}&s={size}',
    })
    .optional(),
  about: z
    .object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      experiences: z
        .array(
          z.object({
            role: z.string(),
            company: z.string(),
            period: z.string(),
            public: z.boolean().default(true).optional(),
          }),
        )
        .optional(),
      socialLinks: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
            icon: z.string().optional(),
            displayMode: z.enum(['icon', 'text', 'both']).optional(),
          }),
        )
        .optional(),
      email: z
        .object({
          address: z.string(),
          icon: z.string().optional(),
          displayMode: z.enum(['icon', 'text', 'both']).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfigParsed = z.output<typeof siteConfigSchema>;
