import { StyleSheet, Text, View } from 'react-native';
import type { PublicUser } from '../services/types';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Avatar from './Avatar';

type OrganizerCardProps = {
  organizer: PublicUser;
};

const AVATAR_SIZE = 48;

export default function OrganizerCard({ organizer }: OrganizerCardProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Avatar name={organizer.name} size={AVATAR_SIZE} />
      <View style={styles.text}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>HOSTED BY</Text>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>{organizer.name}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{organizer.headline}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1 },
});
