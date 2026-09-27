import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useThemeColors } from '../theme/colors';
import { durations, springs } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatRelativeTime } from '../utils/date';
import PressableScale from './PressableScale';

type OfflineBannerProps = {
  /** When the cached events on screen were saved; null if they came from this session. */
  savedAt: string | null;
  onRetry: () => void;
};

const ICON_SIZE = 18;

export default function OfflineBanner({ savedAt, onRetry }: OfflineBannerProps) {
  const colors = useThemeColors();
  const detail = savedAt ? ` · showing events saved ${formatRelativeTime(new Date(savedAt))}` : '';

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(springs.entrance.damping)}
      exiting={FadeOut.duration(durations.fast)}
      style={[styles.banner, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline-outline" size={ICON_SIZE} color={colors.textSecondary} />
      <Text style={[typography.caption, styles.text, { color: colors.textSecondary }]}>
        You're offline{detail}
      </Text>
      <PressableScale onPress={onRetry} accessibilityLabel="Retry loading events">
        <Text style={[typography.label, { color: colors.primary }]}>Retry</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  text: { flex: 1 },
});
