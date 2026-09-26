import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors, withAlpha } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { IconName } from '../utils/categoryIcons';

type InfoRowProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  /** Optional trailing control, e.g. a switch in settings rows. */
  right?: ReactNode;
};

const TILE_SIZE = 40;
const ICON_SIZE = 20;

export default function InfoRow({ icon, title, subtitle, right }: InfoRowProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: withAlpha(colors.primary, 0.14) }]}>
        <Ionicons name={icon} size={ICON_SIZE} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
});
