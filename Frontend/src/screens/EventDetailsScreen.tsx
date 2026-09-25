import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { EventsStackParamList } from '../navigation/types';
import { getEventComments } from '../services/mockApi';
import { useEventsStore } from '../store/eventsStore';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatEventDate, formatEventTime } from '../utils/date';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

export default function EventDetailsScreen({ navigation, route }: Props) {
  const { eventId, title } = route.params;
  const colors = useThemeColors();
  const event = useEventsStore((state) => state.selectedEvent);
  const selectEvent = useEventsStore((state) => state.selectEvent);
  const clearSelectedEvent = useEventsStore((state) => state.clearSelectedEvent);

  useEffect(() => {
    selectEvent(eventId);
    return clearSelectedEvent;
  }, [eventId, selectEvent, clearSelectedEvent]);

  const commentCount = getEventComments(eventId).length;
  const meta = event
    ? [
        `${formatEventDate(event.startsAt)} · ${formatEventTime(event.startsAt)}`,
        `${event.location.venue}, ${event.location.address}`,
        `${event.attendeeCount}/${event.capacity} going · ${commentCount} comments`,
      ]
    : [];

  return (
    <ScreenContainer title={event?.title ?? title} subtitle={event?.description}>
      {meta.map((line) => (
        <Text key={line} style={[typography.label, styles.meta, { color: colors.textSecondary }]}>
          {line}
        </Text>
      ))}
      <AppButton label="Back to events" variant="ghost" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  meta: { marginBottom: spacing.xs },
});
