export const ecrTheme = {
  colors: {
    primaryRed: '#D61F2A',
    deepNavy: '#0A1A33',
    pertaminaBlue: '#005BAC',
    pertaminaGreen: '#0E9F6E',
    warningOrange: '#F97316',
    background: '#F7FAFF',
    backgroundAlt: '#ECF4FC',
    card: '#FFFFFF',
    surface: '#F8FBFF',
    textPrimary: '#102B57',
    textSecondary: '#667085',
    textMuted: '#94A3B8',
    border: '#DCE6F5',
    borderStrong: '#C7D3E3',
    successSoft: '#ECFDF3',
    warningSoft: '#FFF7ED',
    infoSoft: '#EFF6FF',
    dangerSoft: '#FEF2F2',
  },
  gradients: {
    page: ['#F8FBFF', '#EEF5FC', '#FBFDFF'] as const,
    hero: ['rgba(10,26,51,0.98)', 'rgba(0,91,172,0.96)', 'rgba(214,31,42,0.92)'] as const,
    heroAlt: ['rgba(0,91,172,0.96)', 'rgba(15,23,42,0.92)'] as const,
    button: ['#E31E24', '#B71C1C'] as const,
    buttonBlue: ['#005BAC', '#0B1F3A'] as const,
  },
  radii: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 28,
    xl: 34,
    full: 999,
  },
  shadows: {
    soft: {
      shadowColor: '#0B1F3A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 2,
    },
    medium: {
      shadowColor: '#0B1F3A',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.1,
      shadowRadius: 22,
      elevation: 4,
    },
  },
  status: {
    open: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
    progress: { bg: '#FFF7ED', border: '#FED7AA', text: '#F97316' },
    close: { bg: '#ECFDF3', border: '#BBF7D0', text: '#16A34A' },
    pending: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' },
  },
  departments: {
    security: { color: '#2563EB', soft: '#EAF2FF', border: '#D8E7FF', ink: '#123C8C', icon: 'S' },
    fire: { color: '#DC2626', soft: '#FFF0F0', border: '#F6D2D2', ink: '#B91C1C', icon: 'F' },
    medical: { color: '#16A34A', soft: '#ECFBF4', border: '#CDEFD9', ink: '#047857', icon: 'M' },
    it: { color: '#F97316', soft: '#FFF5EC', border: '#F6DEC2', ink: '#C2410C', icon: 'IT' },
  },
} as const;

export type EcrStatusTone = keyof typeof ecrTheme.status;
export type EcrDepartmentTone = keyof typeof ecrTheme.departments;
