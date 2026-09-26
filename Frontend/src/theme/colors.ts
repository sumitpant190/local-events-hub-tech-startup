import { useThemeScheme } from './themeContext';

export type ColorPalette = {
  // Core palette (Phase 1 spec)
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  onPrimary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  error: string;
  border: string;
  // Semantic roles, tuned per scheme. Use these instead of ad-hoc withAlpha() values.
  /** Accent/error used as text or icon color; darker in light mode so it stays readable. */
  accentText: string;
  errorText: string;
  /** Soft fills: icon tiles, count badges, tags. */
  primaryTint: string;
  accentTint: string;
  errorTint: string;
  /** Larger branded areas: event covers and heroes. */
  primarySurface: string;
  /** Hairline borders on tinted fills. */
  primaryBorder: string;
  accentBorder: string;
  errorBorder: string;
  /** Decorative glow orbs behind content. */
  glowPrimary: string;
  glowAccent: string;
  /** Translucent card over glows (auth card, floating buttons). */
  surfaceGlass: string;
  /** Dimmed backdrop behind sheets and modals. */
  scrim: string;
};

/** Appends an alpha channel to a 6-digit hex token. Prefer the semantic palette roles in UI code. */
export function withAlpha(hex: string, alpha: number): string {
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex}${channel.toString(16).padStart(2, '0')}`;
}

const PRIMARY = '#6C5CE7';
const ACCENT = '#22D3EE';
const ERROR = '#FF6B6B';
const INK = '#0B0E14';
const PAPER = '#F5F6FA';

// Dark: tints can run stronger because they sit on near-black; glows are the main source of colour.
export const darkColors: ColorPalette = {
  background: INK,
  surface: '#151925',
  surfaceElevated: '#1E2333',
  primary: PRIMARY,
  onPrimary: PAPER, // text on primary fills; stays light in both modes
  accent: ACCENT,
  textPrimary: PAPER,
  textSecondary: '#8B8FA3',
  success: '#3DDC97',
  error: ERROR,
  border: '#262B3D',

  accentText: ACCENT,
  errorText: ERROR,
  primaryTint: withAlpha(PRIMARY, 0.14),
  accentTint: withAlpha(ACCENT, 0.12),
  errorTint: withAlpha(ERROR, 0.12),
  primarySurface: withAlpha(PRIMARY, 0.18),
  primaryBorder: withAlpha(PRIMARY, 0.4),
  accentBorder: withAlpha(ACCENT, 0.35),
  errorBorder: withAlpha(ERROR, 0.35),
  glowPrimary: withAlpha(PRIMARY, 0.28),
  glowAccent: withAlpha(ACCENT, 0.15),
  surfaceGlass: withAlpha('#151925', 0.92),
  scrim: withAlpha(INK, 0.75),
};

// Light: background/text inverted per spec and primary/accent fills kept identical, but the supporting
// roles are designed for a white canvas rather than mirrored: lighter tints and glows (strong ones look
// muddy on white), stronger borders, a dark scrim (a light one reads as a wash, not a backdrop), and
// darker accent/error text so cyan and coral stay legible on white.
export const lightColors: ColorPalette = {
  background: PAPER,
  surface: '#FFFFFF',
  surfaceElevated: '#ECEEF4',
  primary: PRIMARY,
  onPrimary: PAPER,
  accent: ACCENT,
  textPrimary: INK,
  textSecondary: '#5E6275',
  success: '#3DDC97',
  error: ERROR,
  border: '#DCDFE8',

  accentText: '#0E7490',
  errorText: '#C53030',
  primaryTint: withAlpha(PRIMARY, 0.1),
  accentTint: withAlpha(ACCENT, 0.14),
  errorTint: withAlpha(ERROR, 0.1),
  primarySurface: withAlpha(PRIMARY, 0.12),
  primaryBorder: withAlpha(PRIMARY, 0.35),
  accentBorder: withAlpha(ACCENT, 0.55),
  errorBorder: withAlpha(ERROR, 0.45),
  glowPrimary: withAlpha(PRIMARY, 0.14),
  glowAccent: withAlpha(ACCENT, 0.12),
  surfaceGlass: withAlpha('#FFFFFF', 0.9),
  scrim: withAlpha(INK, 0.4),
};

export function useThemeColors(): ColorPalette {
  return useThemeScheme().scheme === 'light' ? lightColors : darkColors;
}
