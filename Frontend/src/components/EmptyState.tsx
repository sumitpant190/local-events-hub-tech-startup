import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { IconName } from '../utils/categoryIcons';
import AppButton from './AppButton';
import FadeInUp from './FadeInUp';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const ICON_SIZE = 40;

export default function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <FadeInUp style={styles.container}>
      <Ionicons name={icon} size={ICON_SIZE} color={colors.primary} />
      <Text style={[typography.h3, styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[typography.body, styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? <AppButton label={actionLabel} variant="ghost" onPress={onAction} /> : null}
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.lg },
  title: { marginTop: spacing.md },
  message: { marginTop: spacing.xs, textAlign: 'center' },
});
