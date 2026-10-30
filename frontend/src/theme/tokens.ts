/**
 * AHRAO Centralized Classical Academic Design Tokens
 * 
 * Enforces unified visual standards across all six institutional roles:
 * Classical Ivory & Champagne Gold Palette, Serif Headings, Delicate Borders.
 */

export const COLOR_TOKENS = {
  // Core Surfaces with Classical Ivory Glassmorphism
  background: {
    base: '#FFFEFA',        // Primary warm ivory canvas
    surface: '#FFFFFF',     // Pure white card / panel surface
    surfaceGlass: 'rgba(255, 255, 255, 0.78)', // Translucent glass surface
    secondary: '#F8F6F0',   // Subtle ivory beige surface
    tertiary: '#FBF9F3',    // Warm parchment containers & alternate cards
    tertiaryGlass: 'rgba(251, 249, 243, 0.72)', // Translucent parchment
    hover: '#F4F0E6',       // Creamy warm hover state
    active: '#E8E0D0',      // Soft parchment active state
    sidebar: '#FFFFFF',     // Clean classical sidebar
    sidebarGlass: 'rgba(255, 254, 250, 0.86)', // Glass sidebar
    headerGlass: 'rgba(255, 254, 250, 0.82)',  // Glass header
  },

  // Borders & Dividers
  border: {
    subtle: '#E8E0D0',      // Soft parchment divider
    default: '#D8C9A8',     // Delicate champagne gold border
    glass: 'rgba(216, 201, 168, 0.65)', // Glass border
    hover: '#B8A16A',       // Primary accent gold hover
    focus: '#B8A16A',       // Primary accent gold focus
    dark: '#D8C9A8',
  },

  // Text & Content Hierarchy
  text: {
    primary: '#202020',     // High-emphasis deep charcoal / obsidian
    secondary: '#555555',   // Refined graphite body text
    muted: '#77736A',       // Warm stone gray captions & labels
    inverse: '#FFFEFA',     // Ivory white on dark buttons
  },

  // Brand Accents
  brand: {
    gold: {
      DEFAULT: '#B8A16A',
      light: '#D8C9A8',
      dark: '#8C7748',
      subtle: '#F4F0E6',
    },
    indigo: {
      DEFAULT: '#B8A16A',
      light: '#D8C9A8',
      dark: '#A38C57',
      subtle: '#F4F0E6',
    },
    teal: {
      DEFAULT: '#3F7655',
      light: '#538D6B',
      dark: '#326044',
      subtle: '#EEF6F1',
    },
    purple: {
      DEFAULT: '#657C91',
      light: '#889BB0',
      dark: '#4B5E70',
      subtle: '#EFF4F8',
    },
    blue: {
      DEFAULT: '#657C91',
      light: '#889BB0',
      dark: '#4B5E70',
      subtle: '#EFF4F8',
    },
    orange: {
      DEFAULT: '#A87928',
      light: '#C79744',
      dark: '#8A621D',
      subtle: '#FAF4E8',
    },
  },

  // Semantic Status Accents
  status: {
    success: {
      bg: '#EEF6F1',
      text: '#3F7655',
      border: '#C1DFCD',
    },
    warning: {
      bg: '#FAF4E8',
      text: '#A87928',
      border: '#EED9B2',
    },
    danger: {
      bg: '#FDF0F0',
      text: '#B44747',
      border: '#ECC6C6',
    },
    info: {
      bg: '#EFF4F8',
      text: '#657C91',
      border: '#C6D5E2',
    },
    neutral: {
      bg: '#F8F6F0',
      text: '#555555',
      border: '#E8E0D0',
    },
  },

  // Role Emphasis Accents
  role: {
    ADMIN: { accent: '#B8A16A', bgGlow: 'rgba(184, 161, 106, 0.12)', badgeVariant: 'gold' },
    PRINCIPAL: { accent: '#202020', bgGlow: 'rgba(32, 32, 32, 0.08)', badgeVariant: 'charcoal' },
    HOD: { accent: '#657C91', bgGlow: 'rgba(101, 124, 145, 0.12)', badgeVariant: 'blue' },
    FACULTY: { accent: '#B8A16A', bgGlow: 'rgba(184, 161, 106, 0.12)', badgeVariant: 'gold' },
    STUDENT: { accent: '#3F7655', bgGlow: 'rgba(63, 118, 85, 0.12)', badgeVariant: 'teal' },
    WARDEN: { accent: '#A87928', bgGlow: 'rgba(168, 121, 40, 0.12)', badgeVariant: 'orange' },
  },
} as const;

export const TYPOGRAPHY_TOKENS = {
  display: 'text-3xl font-serif font-bold tracking-tight text-[#202020]',
  pageTitle: 'text-2xl font-serif font-bold tracking-tight text-[#202020]',
  sectionTitle: 'text-lg font-serif font-semibold tracking-normal text-[#202020]',
  cardTitle: 'text-sm font-semibold tracking-normal text-[#202020]',
  body: 'text-xs sm:text-sm font-normal text-[#555555] leading-relaxed',
  secondary: 'text-xs text-[#77736A]',
  caption: 'text-[11px] text-[#77736A] font-mono',
  label: 'text-xs font-semibold text-[#555555] uppercase tracking-wider',
} as const;

export const SHADOW_TOKENS = {
  card: '0 8px 24px rgba(90, 75, 45, 0.06)',
  cardHover: '0 12px 30px rgba(90, 75, 45, 0.10)',
  dropdown: '0 14px 28px rgba(90, 75, 45, 0.08), 0 4px 10px rgba(90, 75, 45, 0.04)',
  modal: '0 24px 48px -12px rgba(40, 30, 15, 0.20), 0 8px 24px rgba(90, 75, 45, 0.08)',
  glass: '0 8px 24px rgba(90, 75, 45, 0.06)',
  glassHover: '0 12px 32px rgba(90, 75, 45, 0.10)',
} as const;

export const GLASS_STYLE = {
  card: 'bg-white/80 backdrop-blur-md border border-[#D8C9A8]/65 shadow-glass rounded-2xl',
  cardHover: 'hover:bg-white/90 hover:border-[#B8A16A]/85 hover:shadow-glass-hover transition-all duration-200',
  subtle: 'bg-[#FBF9F3]/75 backdrop-blur-sm border border-[#E8E0D0]/80 shadow-glass-sm rounded-xl',
  header: 'bg-[#FFFEFA]/85 backdrop-blur-md border-b border-[#D8C9A8]/50 shadow-sm',
  sidebar: 'bg-[#FFFEFA]/88 backdrop-blur-lg border-r border-[#D8C9A8]/55',
  input: 'bg-white/80 backdrop-blur-sm border border-[#D8C9A8]/70 focus:bg-white/95 focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 transition-all',
} as const;

export const TRANSITION_TOKENS = {
  default: 'transition-all duration-150 ease-in-out',
  fast: 'transition-all duration-100 ease-out',
  smooth: 'transition-all duration-200 ease-in-out',
} as const;
