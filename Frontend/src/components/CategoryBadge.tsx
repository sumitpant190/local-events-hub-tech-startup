import { StyleSheet, Text, View } from 'react-native';
import type { EventCategory } from '../services/types';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CategoryBadgeProps = {
  category: EventCategory;
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.accentTint, borderColor: colors.accentBorder }]}>
      <Text style={[typography.overline, { color: colors.accentText }]}>{category.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
