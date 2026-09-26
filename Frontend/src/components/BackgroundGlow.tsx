import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { useThemeColors, withAlpha } from '../theme/colors';

const GLOW_SIZE = 340;
const GLOW_PULSE_MS = 4200;

// Two soft brand-colored orbs that breathe slowly behind auth screens.
export default function BackgroundGlow() {
  const colors = useThemeColors();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <MotiView
        from={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.15, opacity: 1 }}
        transition={{ type: 'timing', duration: GLOW_PULSE_MS, loop: true }}
        style={[styles.orb, styles.topRight, { backgroundColor: withAlpha(colors.primary, 0.22) }]}
      />
      <MotiView
        from={{ scale: 1.1, opacity: 1 }}
        animate={{ scale: 0.95, opacity: 0.7 }}
        transition={{ type: 'timing', duration: GLOW_PULSE_MS, loop: true }}
        style={[styles.orb, styles.bottomLeft, { backgroundColor: withAlpha(colors.accent, 0.14) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
  },
  topRight: { top: -GLOW_SIZE / 3, right: -GLOW_SIZE / 3 },
  bottomLeft: { bottom: -GLOW_SIZE / 3, left: -GLOW_SIZE / 2.5 },
});
