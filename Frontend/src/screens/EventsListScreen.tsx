import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { StyleSheet, Text } from 'react-native';
import PressableScale from '../components/PressableScale';
import ScreenContainer from '../components/ScreenContainer';
import type { EventsStackParamList } from '../navigation/types';
import { useThemeColors } from '../theme/colors';
import { STAGGER_MS, springs } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventsList'>;

// Placeholder rows until the events data layer lands.
const PLACEHOLDER_EVENTS = [
  { id: '1', title: 'Startup Pitch Night' },
  { id: '2', title: 'React Native Meetup' },
  { id: '3', title: 'AI Builders Hackathon' },
];

export default function EventsListScreen({ navigation }: Props) {
  const colors = useThemeColors();

  return (
    <ScreenContainer title="Events" subtitle="Tap an event to see details.">
      {PLACEHOLDER_EVENTS.map((event, index) => (
        <MotiView
          key={event.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...springs.entrance, delay: index * STAGGER_MS }}
        >
          <PressableScale
            onPress={() => navigation.navigate('EventDetails', { eventId: event.id, title: event.title })}
            accessibilityLabel={`Open ${event.title}`}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[typography.h3, { color: colors.textPrimary }]}>{event.title}</Text>
            <Text style={[typography.caption, { color: colors.accent }]}>Details coming soon</Text>
          </PressableScale>
        </MotiView>
      ))}
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
