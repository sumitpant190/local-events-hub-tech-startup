import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { EventsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

export default function EventDetailsScreen({ navigation, route }: Props) {
  const { title, eventId } = route.params;

  return (
    <ScreenContainer title={title} subtitle={`Event #${eventId}. Full details arrive in a later phase.`}>
      <AppButton label="Back to events" variant="ghost" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
