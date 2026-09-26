import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SettingsGroupProps = {
  title: string;
  children: ReactNode;
};

export default function SettingsGroup({ title, children }: SettingsGroupProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.group}>
      <Text style={[typography.caption, styles.title, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.xl },
  title: { letterSpacing: 1.5, marginBottom: spacing.sm, marginLeft: spacing.xs },
  card: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
