import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import PressableScale from './PressableScale';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
};

export default function AppButton({ label, onPress, variant = 'primary' }: AppButtonProps) {
  const colors = useThemeColors();

  const variantStyles = {
    primary: { container: { backgroundColor: colors.primary }, text: colors.onPrimary },
    ghost: {
      container: { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
      text: colors.textPrimary,
    },
    danger: {
      container: {
        backgroundColor: colors.errorTint,
        borderColor: colors.errorBorder,
        borderWidth: StyleSheet.hairlineWidth,
      },
      text: colors.errorText,
    },
  }[variant];

  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={[styles.button, variantStyles.container]}>
      <Text style={[typography.bodyStrong, { color: variantStyles.text }]}>{label}</Text>
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
