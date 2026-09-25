import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const signup = useAuthStore((state) => state.signup);

  return (
    <ScreenContainer title="Join the hub" subtitle="Create an account to save and RSVP to events.">
      {/* Form inputs come with the auth UI phase; this signs up a sample account. */}
      <AppButton label="Sign up" onPress={() => signup('New Member', 'new.member@example.com')} />
      <AppButton label="I already have an account" variant="ghost" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
