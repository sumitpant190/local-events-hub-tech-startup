import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../theme/colors';
import { useThemeScheme } from '../theme/themeContext';
import { fontAssets } from '../theme/typography';
import SplashLoader from './SplashLoader';

// Keeps the branded splash on screen long enough to read, even when fonts are cached.
const SPLASH_MIN_MS = 1200;

SplashScreen.preventAutoHideAsync();

// Font loading, branded splash and the navigator; lives inside ThemeProvider so it can read the theme.
export default function AppShell() {
  const colors = useThemeColors();
  const { scheme } = useThemeScheme();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const startAuthListener = useAuthStore((state) => state.startAuthListener);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  // Firebase Auth restores a persisted session asynchronously; the listener reports it (or null).
  useEffect(() => startAuthListener(), [startAuthListener]);

  // Waiting for auth keeps a signed-in user from flashing the Login screen on a cold start.
  // A font error falls back to system fonts rather than trapping the user on the splash.
  const isReady = (fontsLoaded || fontError != null) && minTimeElapsed && isAuthReady;

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {isReady ? (
        <View style={styles.fill}>
          <RootNavigator />
        </View>
      ) : (
        <MotiView style={styles.fill} onLayout={() => SplashScreen.hide()}>
          <SplashLoader />
        </MotiView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
