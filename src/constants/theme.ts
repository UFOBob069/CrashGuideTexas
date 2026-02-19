// ============================================================
// CrashGuide Texas - Theme & Design Constants
// Premium, modern design system with depth and warmth
// ============================================================

export const COLORS = {
  // Primary palette - rich deep blues with more range
  primary: '#0B1A2F',
  primaryLight: '#162D50',
  primaryMid: '#112240',
  primaryDark: '#070F1D',
  primarySoft: '#1E3A5F',

  // Accent - warm amber/gold with glow
  accent: '#F5A623',
  accentLight: '#FFC857',
  accentDark: '#D4891A',
  accentGlow: 'rgba(245, 166, 35, 0.18)',
  accentSubtle: 'rgba(245, 166, 35, 0.08)',

  // Emergency - vivid coral-red
  emergency: '#EF4444',
  emergencyLight: '#FCA5A5',
  emergencyDark: '#DC2626',
  emergencyBg: 'rgba(239, 68, 68, 0.08)',
  emergencyGlow: 'rgba(239, 68, 68, 0.3)',

  // Success - rich emerald
  success: '#10B981',
  successLight: '#6EE7B7',
  successDark: '#059669',
  successBg: 'rgba(16, 185, 129, 0.08)',
  successGlow: 'rgba(16, 185, 129, 0.2)',

  // Info blue
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.08)',

  // Neutral grays - warm-tinted
  white: '#FFFFFF',
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceTinted: '#F8FAFF',
  border: '#E2E8F0',
  borderLight: '#EEF2F7',
  borderAccent: 'rgba(245, 166, 35, 0.2)',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  textOnDark: '#F8FAFC',
  textOnDarkMuted: 'rgba(248, 250, 252, 0.6)',
  textOnDarkSubtle: 'rgba(248, 250, 252, 0.35)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Card tints for variety
  cardBlue: 'rgba(59, 130, 246, 0.07)',
  cardAmber: 'rgba(245, 166, 35, 0.07)',
  cardGreen: 'rgba(16, 185, 129, 0.07)',
  cardRed: 'rgba(239, 68, 68, 0.07)',
  cardPurple: 'rgba(139, 92, 246, 0.07)',

  // Glassmorphism helpers
  glass: 'rgba(255, 255, 255, 0.08)',
  glassLight: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 32,
  display: 38,
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  glow: (color: string, opacity = 0.4) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: opacity,
    shadowRadius: 16,
    elevation: 8,
  }),
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
