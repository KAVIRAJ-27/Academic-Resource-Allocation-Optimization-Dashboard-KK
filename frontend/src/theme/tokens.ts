/**
 * AHRAO Centralized Design Tokens
 * 
 * Enforces unified visual standards across all six institutional roles:
 * Dark SaaS Palette, Typography Scale, Spacing, Shadows, and Semantic Statuses.
 */

export const COLOR_TOKENS = {
  // Core Dark SaaS Surfaces
  background: {
    base: '#080A0F',        // Primary canvas
    surface: '#11141C',     // Primary card / panel surface
    secondary: '#171A23',   // Elevated card / input background
    tertiary: '#141822',    // Nested containers / table headers
    hover: '#222838',       // Interactive hover state
    active: '#2A3245',      // Interactive active state
  },

  // Borders & Dividers
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    default: '#1E2330',
    hover: '#2E3547',
    focus: '#0D9488',
  },

  // Text & Content Hierarchy
  text: {
    primary: '#F3F4F6',     // High-emphasis text
    secondary: '#9CA3AF',   // Medium-emphasis / body text
    muted: '#6B7280',       // Low-emphasis / captions / placeholders
    inverse: '#080A0F',     // Text on light backgrounds
  },

  // Brand Accents
  brand: {
    teal: {
      DEFAULT: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
      glow: 'rgba(20, 184, 166, 0.20)',
    },
    purple: {
      DEFAULT: '#8B5CF6',
      light: '#A78BFA',
      dark: '#6D28D9',
      glow: 'rgba(139, 92, 246, 0.20)',
    },
    blue: {
      DEFAULT: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8',
      glow: 'rgba(59, 130, 246, 0.20)',
    },
    orange: {
      DEFAULT: '#F97316',
      light: '#FB923C',
      dark: '#C2410C',
      glow: 'rgba(249, 115, 22, 0.20)',
    },
  },

  // Semantic Status Accents
  status: {
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#34D399',
      border: 'rgba(16, 185, 129, 0.30)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#FBBF24',
      border: 'rgba(245, 158, 11, 0.30)',
    },
    danger: {
      bg: 'rgba(244, 63, 94, 0.12)',
      text: '#FB7185',
      border: 'rgba(244, 63, 94, 0.30)',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.12)',
      text: '#60A5FA',
      border: 'rgba(59, 130, 246, 0.30)',
    },
    neutral: {
      bg: 'rgba(107, 114, 128, 0.15)',
      text: '#9CA3AF',
      border: 'rgba(107, 114, 128, 0.30)',
    },
  },

  // Role Emphasis Accents
  role: {
    ADMIN: { accent: '#0D9488', bgGlow: 'rgba(13, 148, 136, 0.15)', badgeVariant: 'teal' },
    PRINCIPAL: { accent: '#3B82F6', bgGlow: 'rgba(59, 130, 246, 0.15)', badgeVariant: 'blue' },
    HOD: { accent: '#8B5CF6', bgGlow: 'rgba(139, 92, 246, 0.15)', badgeVariant: 'purple' },
    FACULTY: { accent: '#6366F1', bgGlow: 'rgba(99, 102, 241, 0.15)', badgeVariant: 'purple' },
    STUDENT: { accent: '#14B8A6', bgGlow: 'rgba(20, 184, 166, 0.15)', badgeVariant: 'teal' },
    WARDEN: { accent: '#F97316', bgGlow: 'rgba(249, 115, 22, 0.15)', badgeVariant: 'orange' },
  },
} as const;

export const TYPOGRAPHY_TOKENS = {
  display: 'text-3xl font-extrabold tracking-tight',
  pageTitle: 'text-2xl font-bold tracking-tight',
  sectionTitle: 'text-lg font-semibold tracking-normal',
  cardTitle: 'text-sm font-semibold tracking-normal',
  body: 'text-xs sm:text-sm font-normal text-gray-300 leading-relaxed',
  secondary: 'text-xs text-gray-400',
  caption: 'text-[11px] text-gray-500 font-mono',
  label: 'text-xs font-semibold text-gray-300 uppercase tracking-wider',
} as const;

export const SHADOW_TOKENS = {
  card: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
  glowTeal: '0 0 25px -5px rgba(20, 184, 166, 0.15)',
  glowPurple: '0 0 25px -5px rgba(139, 92, 246, 0.15)',
  dropdown: '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 4px 10px -2px rgba(0, 0, 0, 0.5)',
  modal: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
} as const;

export const TRANSITION_TOKENS = {
  default: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-out',
  smooth: 'transition-all duration-300 ease-in-out',
} as const;
