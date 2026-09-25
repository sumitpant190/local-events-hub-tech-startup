import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { AuthStackParamList } from '../navigation/types';
import { DEMO_USER_EMAIL } from '../services/mockApi';
import { useAuthStore } from '../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);

  return (
    <ScreenContainer title="Welcome back" subtitle="Log in to find tech & startup events near you.">
      {/* Form inputs come with the auth UI phase; this logs in as the demo user. */}
      <AppButton label="Log in as demo user" onPress={() => login(DEMO_USER_EMAIL)} />
      <AppButton label="Create an account" variant="ghost" onPress={() => navigation.navigate('Signup')} />
    </ScreenContainer>
  );
}
