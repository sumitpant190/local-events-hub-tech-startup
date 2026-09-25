import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import PressableScale from './PressableScale';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
};

export default function AppButton({ label, onPress, variant = 'primary' }: AppButtonProps) {
  const colors = useThemeColors();
  const isPrimary = variant === 'primary';

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      style={[
        styles.button,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Text style={[typography.bodyStrong, { color: isPrimary ? colors.onPrimary : colors.textPrimary }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
});
