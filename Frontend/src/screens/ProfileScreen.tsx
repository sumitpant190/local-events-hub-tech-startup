import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp as EnterFadeUp, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import Avatar from '../components/Avatar';
import BottomSheetModal from '../components/BottomSheetModal';
import EditProfileForm from '../components/EditProfileForm';
import EmptyState from '../components/EmptyState';
import EventListItem from '../components/EventListItem';
import FadeInUp from '../components/FadeInUp';
import type { MainTabParamList } from '../navigation/types';
import type { EventItem } from '../services/types';
import { useAuthStore } from '../store/authStore';
import { useEventsStore } from '../store/eventsStore';
import { useThemeColors } from '../theme/colors';
import { durations, springs, STAGGER_MS } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

const AVATAR_SIZE = 88;
const SPRING_DAMPING = 18;

export default function ProfileScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const currentUser = useAuthStore((state) => state.currentUser);
  const events = useEventsStore((state) => state.events);
  const rsvpEventIds = useEventsStore((state) => state.rsvpEventIds);
  const [isEditing, setIsEditing] = useState(false);

  // events is already ordered by `date` (Firestore orderBy), so this keeps RSVPs in chronological order.
  const myEvents = useMemo(() => events.filter((event) => rsvpEventIds.includes(event.id)), [events, rsvpEventIds]);

  // initial: false keeps EventsList underneath, so back from details lands on the list.
  const openEvent = (event: EventItem) =>
    navigation.navigate('EventsTab', {
      screen: 'EventDetails',
      params: { eventId: event.id, title: event.title },
      initial: false,
    });

  // Tabs only render when logged in; this guards the brief frame during logout.
  if (!currentUser) return null;

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInUp index={0} style={styles.header}>
          <MotiView
            from={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springs.entrance}
            style={[styles.avatarRing, { borderColor: colors.primaryBorder }]}
          >
            <Avatar name={currentUser.name} size={AVATAR_SIZE} isHighlighted />
          </MotiView>
          <Text style={[typography.h1, styles.centered, { color: colors.textPrimary }]}>{currentUser.name}</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{currentUser.email}</Text>
          {/* Role comes from users/{uid}.role; attendees (the default) get no badge. */}
          {currentUser.role !== 'attendee' ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryTint }]}>
              <Text style={[typography.label, { color: colors.primary }]}>
                {currentUser.role === 'admin' ? 'Admin' : 'Organizer'}
              </Text>
            </View>
          ) : null}
          <AppButton label="Edit profile" variant="ghost" onPress={() => setIsEditing(true)} />
        </FadeInUp>

        <FadeInUp index={1} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>My RSVPs</Text>
            <View style={[styles.count, { backgroundColor: colors.primaryTint }]}>
              <Text style={[typography.label, { color: colors.primary }]}>{myEvents.length}</Text>
            </View>
          </View>

          {myEvents.length === 0 ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="No RSVPs yet"
              message="Events you RSVP to will show up here."
              actionLabel="Browse events"
              onAction={() => navigation.navigate('EventsTab', { screen: 'EventsList' })}
            />
          ) : (
            myEvents.map((event, index) => (
              <Animated.View
                key={event.id}
                entering={EnterFadeUp.delay(index * STAGGER_MS).springify().damping(SPRING_DAMPING)}
                exiting={FadeOut.duration(durations.fast)}
                layout={LinearTransition.springify().damping(SPRING_DAMPING)}
              >
                <EventListItem event={event} onPress={openEvent} />
              </Animated.View>
            ))
          )}
        </FadeInUp>
      </ScrollView>

      <BottomSheetModal visible={isEditing} onClose={() => setIsEditing(false)} title="Edit profile">
        <EditProfileForm user={currentUser} onDone={() => setIsEditing(false)} />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { alignItems: 'center' },
  avatarRing: { padding: spacing.xs, borderRadius: radius.pill, borderWidth: 2, marginBottom: spacing.lg },
  centered: { textAlign: 'center' },
  roleBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  section: { marginTop: spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  count: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.pill },
});
