import { useColorScheme } from 'react-native';

export type ColorPalette = {
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
};

export const darkColors: ColorPalette = {
  background: '#0B0E14',
  surface: '#151925',
  surfaceElevated: '#1E2333',
  primary: '#6C5CE7',
  onPrimary: '#F5F6FA', // text on primary fills; stays light in both modes
  accent: '#22D3EE',
  textPrimary: '#F5F6FA',
  textSecondary: '#8B8FA3',
  success: '#3DDC97',
  error: '#FF6B6B',
  border: '#262B3D',
};

// Background/text inverted per spec; surface/border/secondary tones are derived to match.
export const lightColors: ColorPalette = {
  ...darkColors,
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceElevated: '#ECEEF4',
  textPrimary: '#0B0E14',
  textSecondary: '#5E6275',
  border: '#DCDFE8',
};

/** Appends an alpha channel to a 6-digit hex token, e.g. withAlpha(colors.primary, 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex}${channel.toString(16).padStart(2, '0')}`;
}

export function useThemeColors(): ColorPalette {
  return useColorScheme() === 'light' ? lightColors : darkColors;
}
