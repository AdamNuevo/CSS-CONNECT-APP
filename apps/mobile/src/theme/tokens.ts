export const colors = {
  primary: '#1B365D',
  primaryDark: '#0F213E',
  primaryLight: '#2B4C7E',

  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentMuted: '#EFF6FF',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',

  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  status: {
    pendingBg: '#FEF3C7',
    pendingText: '#92400E',
    pendingBorder: '#FDE68A',

    successBg: '#DCFCE7',
    successText: '#166534',
    successBorder: '#BBF7D0',

    dangerBg: '#FEE2E2',
    dangerText: '#991B1B',
    dangerBorder: '#FECACA',

    infoBg: '#EFF6FF',
    infoText: '#1D4ED8',
    infoBorder: '#BFDBFE',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;
