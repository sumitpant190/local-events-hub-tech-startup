import { createContext, useContext } from 'react';

export type ColorScheme = 'dark' | 'light';

export interface ThemeContextValue {
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
}

// Kept free of palette imports so colors.ts can read it without a circular dependency.
// The default only applies outside ThemeProvider (e.g. isolated component previews).
export const ThemeContext = createContext<ThemeContextValue>({
  scheme: 'dark',
  setScheme: () => {},
  toggleScheme: () => {},
});

export function useThemeScheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
