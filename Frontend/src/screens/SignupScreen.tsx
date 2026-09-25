import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const enterApp = () => navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] });

  return (
    <ScreenContainer title="Join the hub" subtitle="Create an account to save and RSVP to events.">
      <AppButton label="Sign up" onPress={enterApp} />
      <AppButton label="I already have an account" variant="ghost" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
