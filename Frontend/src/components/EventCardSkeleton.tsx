import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import SkeletonBlock from './SkeletonBlock';

// Mirrors EventCard's layout so content doesn't jump when real cards replace it.
export default function EventCardSkeleton() {
  const colors = useThemeColors();

  return (
    <View
      accessibilityLabel="Loading event"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <SkeletonBlock height={112} radius={0} />
      <View style={styles.body}>
        <SkeletonBlock height={18} width={88} radius={radius.pill} />
        <SkeletonBlock height={20} width="85%" />
        <SkeletonBlock height={12} width="60%" />
        <SkeletonBlock height={12} width="45%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  body: { padding: spacing.lg, gap: spacing.sm },
});
