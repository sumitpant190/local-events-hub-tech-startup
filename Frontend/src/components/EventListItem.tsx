import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import type { EventItem } from '../services/types';
import { useThemeColors } from '../theme/colors';
import { CARD_PRESSED_SCALE } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import { formatEventDate, formatEventDateTime } from '../utils/date';
import { toJSDate } from '../utils/firestoreDates';
import PressableScale from './PressableScale';

type EventListItemProps = {
  event: EventItem;
  onPress: (event: EventItem) => void;
};

const TILE_SIZE = 48;
const ICON_SIZE = 22;
const CHEVRON_SIZE = 18;

// Compact event row for secondary lists (e.g. "My RSVPs"); EventCard is the full-size version.
export default function EventListItem({ event, onPress }: EventListItemProps) {
  const colors = useThemeColors();
  const date = toJSDate(event.date);

  return (
    <PressableScale
      onPress={() => onPress(event)}
      pressedScale={CARD_PRESSED_SCALE}
      accessibilityLabel={`${event.title}, ${formatEventDate(date)}`}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.tile, { backgroundColor: colors.primaryTint }]}>
        <Ionicons name={CATEGORY_ICONS[event.category]} size={ICON_SIZE} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatEventDateTime(date)} · {event.location}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={CHEVRON_SIZE} color={colors.textSecondary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: spacing.xxs },
});
