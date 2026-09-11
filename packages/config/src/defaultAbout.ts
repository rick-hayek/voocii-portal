export const defaultAboutConfig = {
  title: 'The Developer',
  subtitle: 'ABOUT ME',
  description:
    "Hello! I'm Rick, a Full-Stack Engineer who loves building tools that make development easier and more enjoyable.\n\nWith a background in computer science and years of experience in the JavaScript ecosystem, I focus on creating performant, accessible, and beautiful web applications.\n\nWhen I'm not coding, you can find me exploring new technologies, contributing to open source, or sharing my knowledge through writing.",
  experiences: [
    { role: 'Senior Developer', company: 'Tech Corp', period: '2023 — Present' },
    { role: 'Full Stack Engineer', company: 'Startup Inc', period: '2020 — 2023' },
    { role: 'Frontend Developer', company: 'Web Studio', period: '2018 — 2020' },
  ],
  socialLinks: [
    {
      label: 'GitHub',
      href: 'https://github.com/rick-hayek',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>',
      displayMode: 'icon' as const,
    },
    {
      label: 'X',
      href: 'https://x.com',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      displayMode: 'icon' as const,
    },
  ],
  email: {
    address: 'your-email@your-site.com',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    displayMode: 'icon' as const,
  },
};
