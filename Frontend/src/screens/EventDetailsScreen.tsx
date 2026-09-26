import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiText } from 'moti';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedMessage from '../components/AnimatedMessage';
import AttendeePreview from '../components/AttendeePreview';
import BackButton from '../components/BackButton';
import CapacityBar from '../components/CapacityBar';
import CategoryBadge from '../components/CategoryBadge';
import CommentsSection from '../components/CommentsSection';
import EmptyState from '../components/EmptyState';
import EventHero from '../components/EventHero';
import FadeInUp from '../components/FadeInUp';
import InfoRow from '../components/InfoRow';
import OrganizerCard from '../components/OrganizerCard';
import RsvpButton from '../components/RsvpButton';
import type { EventsStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { useEventsStore } from '../store/eventsStore';
import { useThemeColors } from '../theme/colors';
import { timings } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatEventRange } from '../utils/date';
import { isEventFull } from '../utils/rsvp';
import { useEventPeople } from '../utils/useEventPeople';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

export default function EventDetailsScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  // Fall back to the list copy so the first frame (before selectEvent runs) never flashes "not found".
  const event = useEventsStore((state) =>
    state.selectedEvent?.id === eventId
      ? state.selectedEvent
      : (state.events.find((item) => item.id === eventId) ?? null),
  );
  const isGoing = useEventsStore((state) => state.rsvpEventIds.includes(eventId));
  const rsvpError = useEventsStore((state) => state.rsvpError);
  const selectEvent = useEventsStore((state) => state.selectEvent);
  const clearSelectedEvent = useEventsStore((state) => state.clearSelectedEvent);
  const toggleRsvp = useEventsStore((state) => state.toggleRsvp);
  const currentUser = useAuthStore((state) => state.currentUser);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((scrollEvent) => {
    scrollY.value = scrollEvent.contentOffset.y;
  });

  useEffect(() => {
    selectEvent(eventId);
    return clearSelectedEvent;
  }, [eventId, selectEvent, clearSelectedEvent]);

  const { organizer, attendees: faces } = useEventPeople(eventId, event?.organizerId, currentUser?.id);

  if (!event) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Event not found"
          message="It may have been removed or is no longer available."
          actionLabel="Back to events"
          onAction={navigation.goBack}
        />
      </SafeAreaView>
    );
  }

  const spotsLeft = Math.max(event.capacity - event.attendeeCount, 0);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <EventHero category={event.category} scrollY={scrollY} />

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <FadeInUp index={0}>
            <CategoryBadge category={event.category} />
            <Text style={[typography.h1, styles.title, { color: colors.textPrimary }]}>{event.title}</Text>
          </FadeInUp>

          <FadeInUp index={1} style={styles.section}>
            <InfoRow icon="calendar-outline" title={formatEventRange(event.startsAt, event.endsAt)} />
            <InfoRow icon="location-outline" title={event.location.venue} subtitle={event.location.address} />
            <InfoRow icon="people-outline" title={`${event.attendeeCount} attending`} subtitle={`Capacity ${event.capacity}`} />
            <CapacityBar attendeeCount={event.attendeeCount} capacity={event.capacity} />
          </FadeInUp>

          <FadeInUp index={2} style={styles.section}>
            <AttendeePreview
              attendeeCount={event.attendeeCount}
              isGoing={isGoing}
              currentUser={currentUser}
              faces={faces}
            />
          </FadeInUp>

          {organizer ? (
            <FadeInUp index={3} style={styles.section}>
              <OrganizerCard organizer={organizer} />
            </FadeInUp>
          ) : null}

          <FadeInUp index={4} style={styles.section}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>About</Text>
            <Text style={[typography.body, styles.description, { color: colors.textSecondary }]}>
              {event.description}
            </Text>
            <View style={styles.tags}>
              {event.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.primaryTint }]}>
                  <Text style={[typography.caption, { color: colors.primary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </FadeInUp>

          <FadeInUp index={5} style={styles.section}>
            <CommentsSection eventId={event.id} />
          </FadeInUp>
        </View>
      </Animated.ScrollView>

      {/* Fixed above the scrolling hero so it never parallaxes away. */}
      <View style={[styles.back, { top: insets.top + spacing.sm }]}>
        <BackButton onPress={navigation.goBack} />
      </View>

      <View style={[styles.bar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <AnimatedMessage message={rsvpError} variant="banner" />
        <View style={styles.barRow}>
          <View style={styles.barText}>
            <MotiText
              key={event.attendeeCount}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={timings.textSwap}
              style={[typography.h3, { color: colors.textPrimary }]}
            >
              {event.attendeeCount} going
            </MotiText>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'No spots left'}
            </Text>
          </View>
          <RsvpButton isGoing={isGoing} isFull={isEventFull(event)} onPress={() => toggleRsvp(event.id)} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  sheet: {
    marginTop: -radius.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  title: { marginTop: spacing.sm },
  section: { marginTop: spacing.xl },
  description: { marginTop: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tag: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  back: { position: 'absolute', left: spacing.lg },
  bar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  barText: { flex: 1 },
});
