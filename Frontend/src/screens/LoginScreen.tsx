import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  // No auth yet: just swaps the root stack to the app. Real login comes in the auth phase.
  const enterApp = () => navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] });

  return (
    <ScreenContainer title="Welcome back" subtitle="Log in to find tech & startup events near you.">
      <AppButton label="Log in" onPress={enterApp} />
      <AppButton label="Create an account" variant="ghost" onPress={() => navigation.navigate('Signup')} />
    </ScreenContainer>
  );
}
