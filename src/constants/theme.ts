// ============================================================
// CrashGuide Texas - Theme & Design Constants
// ============================================================

export const COLORS = {
  // Primary palette - trustworthy, calm, professional
  primary: '#1B3A5C',        // Deep navy blue
  primaryLight: '#2C5282',   // Lighter navy
  primaryDark: '#0F2440',    // Darker navy

  // Accent - action-oriented but not alarming
  accent: '#E8912D',         // Warm amber/orange
  accentLight: '#F6AD55',
  accentDark: '#C27A1F',

  // Emergency red - used sparingly
  emergency: '#E53E3E',
  emergencyLight: '#FC8181',
  emergencyBg: '#FFF5F5',

  // Success green
  success: '#38A169',
  successLight: '#68D391',
  successBg: '#F0FFF4',

  // Neutral grays
  white: '#FFFFFF',
  background: '#F7FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',

  // Text
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textMuted: '#A0AEC0',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 28,
  display: 34,
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
