import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp as EnterFadeUp, FadeOut, LinearTransition } from 'react-native-reanimated';
import CategoryFilterBar from '../components/CategoryFilterBar';
import EmptyState from '../components/EmptyState';
import EventCard from '../components/EventCard';
import EventCardSkeleton from '../components/EventCardSkeleton';
import FadeInUp from '../components/FadeInUp';
import ScreenContainer from '../components/ScreenContainer';
import SearchBar from '../components/SearchBar';
import type { EventsStackParamList } from '../navigation/types';
import type { EventItem } from '../services/types';
import { useEventsStore } from '../store/eventsStore';
import { MAX_STAGGERED_ITEMS, STAGGER_MS } from '../theme/motion';
import { spacing } from '../theme/spacing';
import { filterEvents, type CategoryFilter } from '../utils/filterEvents';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventsList'>;

const SKELETON_COUNT = 3;
const EXIT_MS = 150;
const SPRING_DAMPING = 18;

export default function EventsListScreen({ navigation }: Props) {
  const events = useEventsStore((state) => state.events);
  const isLoading = useEventsStore((state) => state.isLoading);
  const error = useEventsStore((state) => state.error);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  useEffect(() => {
    if (events.length === 0) loadEvents();
  }, [events.length, loadEvents]);

  const visibleEvents = useMemo(() => filterEvents(events, query, category), [events, query, category]);
  const isFirstLoad = isLoading && events.length === 0;
  const hasLoadError = !isLoading && error !== null && events.length === 0;

  const openEvent = useCallback(
    (event: EventItem) => navigation.navigate('EventDetails', { eventId: event.id, title: event.title }),
    [navigation],
  );

  const resetFilters = () => {
    setQuery('');
    setCategory('All');
  };

  const subtitle = isFirstLoad
    ? 'Finding tech & startup events near you…'
    : `${visibleEvents.length} of ${events.length} upcoming events`;

  return (
    <ScreenContainer title="Discover" subtitle={subtitle}>
      <FadeInUp index={1}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by title" />
      </FadeInUp>
      <FadeInUp index={2}>
        <CategoryFilterBar selected={category} onSelect={setCategory} />
      </FadeInUp>

      {isFirstLoad ? (
        <View>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <FadeInUp key={index} index={index + 3}>
              <EventCardSkeleton />
            </FadeInUp>
          ))}
        </View>
      ) : hasLoadError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load events"
          message={error ?? ''}
          actionLabel="Try again"
          onAction={loadEvents}
        />
      ) : (
        <Animated.FlatList
          data={visibleEvents}
          keyExtractor={(event) => event.id}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={EnterFadeUp.delay(index < MAX_STAGGERED_ITEMS ? index * STAGGER_MS : 0)
                .springify()
                .damping(SPRING_DAMPING)}
              exiting={FadeOut.duration(EXIT_MS)}
            >
              <EventCard event={item} onPress={openEvent} />
            </Animated.View>
          )}
          itemLayoutAnimation={LinearTransition.springify().damping(SPRING_DAMPING)}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No matching events"
              message="Try a different search or category."
              actionLabel="Clear filters"
              onAction={resetFilters}
            />
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: spacing.xxl },
});
