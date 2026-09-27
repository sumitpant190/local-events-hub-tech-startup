import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import type { EventItem } from '../services/types';
import { useThemeColors } from '../theme/colors';
import { CARD_PRESSED_SCALE } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { CATEGORY_ICONS, type IconName } from '../utils/categoryIcons';
import { formatEventDate, formatEventDateTime, getDateParts } from '../utils/date';
import { toJSDate } from '../utils/firestoreDates';
import CategoryBadge from './CategoryBadge';
import PressableScale from './PressableScale';

type EventCardProps = {
  event: EventItem;
  onPress: (event: EventItem) => void;
};

const COVER_HEIGHT = 112;
const COVER_ICON_SIZE = 44;
const META_ICON_SIZE = 14;

export default function EventCard({ event, onPress }: EventCardProps) {
  const colors = useThemeColors();
  const date = toJSDate(event.date);
  const { month, day } = getDateParts(date);

  const metaRows: { icon: IconName; text: string }[] = [
    { icon: 'calendar-outline', text: formatEventDateTime(date) },
    { icon: 'location-outline', text: event.location },
    { icon: 'people-outline', text: `${event.attendeeCount} going` },
  ];

  return (
    <PressableScale
      onPress={() => onPress(event)}
      pressedScale={CARD_PRESSED_SCALE}
      accessibilityLabel={`${event.title}, ${event.category}, ${formatEventDate(date)}`}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* Cover placeholder until events carry real images. */}
      <View style={[styles.cover, { backgroundColor: colors.primarySurface }]}>
        <View style={[styles.coverGlow, { backgroundColor: colors.glowAccent }]} />
        <Ionicons name={CATEGORY_ICONS[event.category]} size={COVER_ICON_SIZE} color={colors.primary} />
        <View style={[styles.dateTile, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[typography.caption, { color: colors.accentText }]}>{month}</Text>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>{day}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <CategoryBadge category={event.category} />
        <Text style={[typography.h3, styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {event.title}
        </Text>
        {metaRows.map((row) => (
          <View key={row.icon} style={styles.metaRow}>
            <Ionicons name={row.icon} size={META_ICON_SIZE} color={colors.textSecondary} />
            <Text style={[typography.caption, styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {row.text}
            </Text>
          </View>
        ))}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  cover: {
    height: COVER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverGlow: {
    position: 'absolute',
    width: COVER_HEIGHT * 2,
    height: COVER_HEIGHT * 2,
    borderRadius: COVER_HEIGHT,
    left: -COVER_HEIGHT / 2,
    top: -COVER_HEIGHT,
  },
  dateTile: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: { padding: spacing.lg, gap: spacing.xs },
  title: { marginTop: spacing.xs, marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { flex: 1 },
});
