import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { MainTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const logOut = () => navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Auth' }] });

  return (
    <ScreenContainer title="Settings" subtitle="Theme and notification preferences coming soon.">
      <AppButton label="View profile" onPress={() => navigation.navigate('Profile')} />
      <AppButton label="Log out" variant="ghost" onPress={logOut} />
    </ScreenContainer>
  );
}
