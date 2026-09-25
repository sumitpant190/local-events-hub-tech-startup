import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import PressableScale from '../components/PressableScale';
import ScreenContainer from '../components/ScreenContainer';
import type { EventsStackParamList } from '../navigation/types';
import { useEventsStore } from '../store/eventsStore';
import { useThemeColors } from '../theme/colors';
import { STAGGER_MS, springs } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatEventDate } from '../utils/date';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventsList'>;

// Caps the stagger so items further down don't wait noticeably long.
const MAX_STAGGERED_ITEMS = 8;

export default function EventsListScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const events = useEventsStore((state) => state.events);
  const isLoading = useEventsStore((state) => state.isLoading);
  const error = useEventsStore((state) => state.error);
  const loadEvents = useEventsStore((state) => state.loadEvents);

  useEffect(() => {
    if (events.length === 0) loadEvents();
  }, [events.length, loadEvents]);

  const status = isLoading ? 'Loading events…' : error ?? `${events.length} upcoming events`;

  return (
    <ScreenContainer title="Events" subtitle={status}>
      <FlatList
        data={events}
        keyExtractor={(event) => event.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...springs.entrance, delay: Math.min(index, MAX_STAGGERED_ITEMS) * STAGGER_MS }}
          >
            <PressableScale
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id, title: item.title })}
              accessibilityLabel={`Open ${item.title}`}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[typography.label, { color: colors.accent }]}>
                {item.category} · {formatEventDate(item.startsAt)}
              </Text>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.location.venue}</Text>
            </PressableScale>
          </MotiView>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
});
