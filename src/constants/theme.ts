// ============================================================
// CrashGuide Texas - Theme & Design Constants
// Modern, bold design system
// ============================================================

export const COLORS = {
  // Primary palette - deep, rich navy
  primary: '#0A1628',         // Very deep navy
  primaryLight: '#1A2D4A',    // Lighter navy for cards
  primaryMid: '#152238',      // Mid navy for headers
  primaryDark: '#060E1A',     // Near-black navy

  // Accent - vibrant amber/gold
  accent: '#F59E0B',          // Bright amber
  accentLight: '#FBBF24',     // Light gold
  accentDark: '#D97706',      // Deep amber
  accentGlow: 'rgba(245, 158, 11, 0.15)', // Subtle amber glow

  // Emergency - vivid red
  emergency: '#EF4444',
  emergencyLight: '#FCA5A5',
  emergencyBg: 'rgba(239, 68, 68, 0.08)',
  emergencyGlow: 'rgba(239, 68, 68, 0.25)',

  // Success - vibrant green
  success: '#10B981',
  successLight: '#6EE7B7',
  successBg: 'rgba(16, 185, 129, 0.08)',

  // Neutral grays - cooler tones
  white: '#FFFFFF',
  background: '#F0F4F8',      // Cool gray background
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',     // Near-black
  textSecondary: '#475569',   // Slate gray
  textMuted: '#94A3B8',       // Light slate
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  textOnDark: '#F8FAFC',
  textOnDarkMuted: 'rgba(248, 250, 252, 0.6)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Card tints for variety
  cardBlue: 'rgba(59, 130, 246, 0.06)',
  cardAmber: 'rgba(245, 158, 11, 0.06)',
  cardGreen: 'rgba(16, 185, 129, 0.06)',
  cardRed: 'rgba(239, 68, 68, 0.06)',
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
  xxl: 24,
  hero: 30,
  display: 36,
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
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;
