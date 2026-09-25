import { MotiText, MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// Shown while custom fonts load, so it uses the system font on purpose.
export default function SplashLoader() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MotiText
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 700 }}
        style={[styles.title, { color: colors.textPrimary }]}
      >
        Local Events Hub
      </MotiText>
      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 700, delay: 250 }}
        style={[styles.subtitle, { color: colors.accent }]}
      >
        TECH & STARTUP
      </MotiText>
      <MotiView
        from={{ opacity: 0.3, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ type: 'timing', duration: 800, loop: true }}
        style={[styles.dot, { backgroundColor: colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
  },
  dot: {
    marginTop: spacing.xxl,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
