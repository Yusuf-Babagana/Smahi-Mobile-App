// constants/theme.ts
// Single source of truth for the S-MAHII redesign design tokens.
// See "S-MAHII Marketplace Redesign" handoff (HANDOFF.md §1).

import { TextStyle, ViewStyle } from 'react-native';

export const color = {
  brand900: '#0B2E5B', // header surfaces
  brand600: '#1B5FD9', // primary actions, links, selection
  brand100: '#EAF1FD', // tonal fills, selected rows
  accent600: '#0D9488', // verification / trust / success
  accent100: '#E7F7F4',
  warn600: '#B45309',
  warn100: '#FEF9EC',
  danger600: '#DC2626',
  star: '#F59E0B', // rating stars ONLY
  ink900: '#0B1F3F', // headings
  ink600: '#475569', // body
  ink400: '#64748B', // secondary
  ink300: '#94A3B8', // placeholder / meta
  border: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceSunken: '#F6F8FB', // screen bg
  surfaceChip: '#E9EEF6', // segmented track
  canvas: '#FDFDFC', // auth/onboarding bg
  online: '#22C55E',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 18, xxl: 22, full: 999 };

export const shadow: Record<'e1' | 'e2' | 'e3' | 'cta', ViewStyle> = {
  e1: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  e2: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  e3: {
    shadowColor: '#0B1F3F',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  cta: {
    shadowColor: '#1B5FD9',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

// Manrope font families registered in app/_layout.tsx via @expo-google-fonts/manrope.
export const font = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

// Typography scale (HANDOFF.md §1). Letter-spacing converted from em to pt.
export const type: Record<
  'display' | 'titleLg' | 'titleMd' | 'heading' | 'bodyStrong' | 'body' | 'caption' | 'micro',
  TextStyle
> = {
  display: { fontFamily: font.extrabold, fontSize: 34, letterSpacing: -0.68, color: color.ink900 },
  titleLg: { fontFamily: font.extrabold, fontSize: 26, letterSpacing: -0.52, color: color.ink900 },
  titleMd: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.19, color: color.ink900 },
  heading: { fontFamily: font.extrabold, fontSize: 16.5, letterSpacing: -0.165, color: color.ink900 },
  bodyStrong: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  body: { fontFamily: font.medium, fontSize: 14, lineHeight: 22.4, color: color.ink600 },
  caption: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400 },
  micro: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
    color: color.ink400,
  },
};

// Minimum touch target 44pt; primary buttons 54pt, compact 44pt.
export const touch = { min: 44, button: 54, buttonCompact: 44 };

// Avatar tonal background/foreground pairs (rotate by name hash).
export const avatarTones: { bg: string; fg: string }[] = [
  { bg: '#EAF1FD', fg: '#1B5FD9' },
  { bg: '#E7F7F4', fg: '#0D9488' },
  { bg: '#FDF0E7', fg: '#C2632B' },
  { bg: '#F0EAFD', fg: '#6D4AC9' },
  { bg: '#FDEAF0', fg: '#C22B63' },
  { bg: '#EEF3E7', fg: '#5B7A2B' },
];

// Status badge palettes (HANDOFF.md §2 Badge).
export const statusTones = {
  confirmed: { bg: color.brand100, fg: color.brand600 },
  pending: { bg: color.warn100, fg: color.warn600 },
  cancelled: { bg: '#FDECEC', fg: '#B91C1C' },
  verified: { bg: color.accent100, fg: '#0F766E' },
} as const;

export const theme = { color, space, radius, shadow, font, type, touch, avatarTones, statusTones };
export default theme;
