import { MotiView } from 'moti';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Appearance, StyleSheet, View } from 'react-native';
import { darkColors, lightColors } from './colors';
import { ThemeContext, type ColorScheme, type ThemeContextValue } from './themeContext';

type ThemeProviderProps = {
  children: ReactNode;
};

type Crossfade = { color: string; key: number };

const CROSSFADE_MS = 320;

function getSystemScheme(): ColorScheme {
  return Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
}

// Scheme lives in memory: it starts from the device setting on every launch.
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [scheme, setSchemeState] = useState<ColorScheme>(getSystemScheme);
  const schemeRef = useRef(scheme);
  // Background of the scheme we're leaving; an overlay in that color fades out to soften the swap.
  const [crossfade, setCrossfade] = useState<Crossfade | null>(null);
  const crossfadeKey = useRef(0);

  const setScheme = useCallback((next: ColorScheme) => {
    const current = schemeRef.current;
    if (current === next) return;
    crossfadeKey.current += 1;
    setCrossfade({ color: (current === 'dark' ? darkColors : lightColors).background, key: crossfadeKey.current });
    schemeRef.current = next;
    setSchemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      setScheme,
      toggleScheme: () => setScheme(schemeRef.current === 'dark' ? 'light' : 'dark'),
    }),
    [scheme, setScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={styles.fill}>
        {children}
        {crossfade ? (
          <MotiView
            key={crossfade.key}
            pointerEvents="none"
            from={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ type: 'timing', duration: CROSSFADE_MS }}
            onDidAnimate={(_key, finished) => {
              if (finished) setCrossfade(null);
            }}
            style={[StyleSheet.absoluteFill, { backgroundColor: crossfade.color }]}
          />
        ) : null}
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
