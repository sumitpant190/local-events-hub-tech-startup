import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashLoader from './src/components/SplashLoader';
import RootNavigator from './src/navigation/RootNavigator';
import { useThemeColors } from './src/theme/colors';
import { fontAssets } from './src/theme/typography';

// Keeps the branded splash on screen long enough to read, even when fonts are cached.
const SPLASH_MIN_MS = 1200;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const colors = useThemeColors();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  // A font error falls back to system fonts rather than trapping the user on the splash.
  const isReady = (fontsLoaded || fontError != null) && minTimeElapsed;

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <StatusBar style="auto" />
      {isReady ? (
        <MotiView
          style={styles.fill}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <RootNavigator />
        </MotiView>
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
