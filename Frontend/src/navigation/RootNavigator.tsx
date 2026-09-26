import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../theme/colors';
import { useThemeScheme } from '../theme/themeContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { stackScreenOptions } from './stackOptions';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const colors = useThemeColors();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const base = useThemeScheme().scheme === 'light' ? DefaultTheme : DarkTheme;
  const theme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {/* Auth state picks the tree; React Navigation animates the swap. */}
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} options={{ animationTypeForReplace: 'pop' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
