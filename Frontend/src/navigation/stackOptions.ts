import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { durations } from '../theme/motion';

// Fade + upward slide for every stack. animationDuration is honoured on iOS;
// Android runs fade_from_bottom at its native timing (~350ms).
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade_from_bottom',
  animationDuration: durations.screen,
  gestureEnabled: true,
};
