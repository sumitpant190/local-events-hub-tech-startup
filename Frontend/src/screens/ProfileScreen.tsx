import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { MainTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Profile" subtitle="Your saved events and RSVPs will live here.">
      <AppButton label="Browse events" onPress={() => navigation.navigate('EventsTab', { screen: 'EventsList' })} />
      <AppButton label="Settings" variant="ghost" onPress={() => navigation.navigate('Settings')} />
    </ScreenContainer>
  );
}
