import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { timings } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { IconName } from '../utils/categoryIcons';
import PressableScale from './PressableScale';

type CategoryChipProps = {
  label: string;
  icon?: IconName;
  isSelected: boolean;
  onPress: () => void;
};

const ICON_SIZE = 14;

export default function CategoryChip({ label, icon, isSelected, onPress }: CategoryChipProps) {
  const colors = useThemeColors();
  const contentColor = isSelected ? colors.onPrimary : colors.textSecondary;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`Filter by ${label}`}
      accessibilityState={{ selected: isSelected }}
    >
      <MotiView
        animate={{
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        }}
        transition={timings.colorShift}
        style={styles.chip}
      >
        {icon ? <Ionicons name={icon} size={ICON_SIZE} color={contentColor} /> : null}
        <Text style={[typography.label, { color: contentColor }]}>{label}</Text>
      </MotiView>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
