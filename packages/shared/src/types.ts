// Site configuration types
export interface SiteConfig {
  site: {
    title: string;
    description: string;
    url: string;
    locale: string;
    author?: string;
  };
  preset?: 'minimal' | 'tech-blog' | 'creative' | 'full' | 'devtools';
  modules: Record<string, ModuleConfig>;
  theme: {
    default: string;
    available: string[];
    allowUserSwitch: boolean;
  };
  homeLayout?: 'classic' | 'metro';
  admin: {
    enabled: boolean;
    basePath: string;
  };
  email?: {
    enabled?: boolean;
    provider?: string;
  };
  comments?: {
    requireModeration?: boolean;
  };
  avatar?: {
    urlTemplate?: string;
  };
  about?: {
    title?: string;
    subtitle?: string;
    description?: string;
    experiences?: {
      role: string;
      company: string;
      period: string;
      public?: boolean;
    }[];
    socialLinks?: {
      label: string;
      href: string;
      icon?: string;
      displayMode?: 'icon' | 'text' | 'both';
    }[];
    email?: {
      address: string;
      icon?: string;
      displayMode?: 'icon' | 'text' | 'both';
    };
  };
}

export interface ModuleConfig {
  enabled: boolean;
  [key: string]: unknown;
}

// Module system types
export interface SiteModule {
  id: string;
  name: string;
  icon: string;
  version: string;
  routes: RouteConfig[];
  navItems?: NavItem[];
  adminRoutes?: RouteConfig[];
  widgets?: WidgetConfig[];
  onInit?: () => Promise<void>;
  onDestroy?: () => void;
  dependencies?: string[];
}

export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  order?: number;
}

export interface WidgetConfig {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
}

// Theme types
export interface ThemeConfig {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary?: string;
    border: string;
    error: string;
    success: string;
    surfaceAlt?: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    monoFont: string;
    scale: number;
  };
  spacing: {
    unit: number;
    radius: string;
  };
  effects: {
    shadow: string;
    blur: string;
    transition: string;
  };
}
