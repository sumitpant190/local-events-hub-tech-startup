import { MotiText, MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { durations } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { systemTypography } from '../theme/typography';

const SUBTITLE_DELAY_MS = 250;
const DOT_SIZE = 8;

// Shown while custom fonts load, so it uses the system font (systemTypography) on purpose.
export default function SplashLoader() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MotiText
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: durations.splash }}
        style={[systemTypography.splashTitle, { color: colors.textPrimary }]}
      >
        Local Events Hub
      </MotiText>
      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: durations.splash, delay: SUBTITLE_DELAY_MS }}
        style={[systemTypography.splashEyebrow, styles.subtitle, { color: colors.accentText }]}
      >
        TECH & STARTUP
      </MotiText>
      <MotiView
        from={{ opacity: 0.3, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ type: 'timing', duration: durations.pulse, loop: true }}
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
  subtitle: { marginTop: spacing.sm },
  dot: {
    marginTop: spacing.xxl,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.pill,
  },
});
