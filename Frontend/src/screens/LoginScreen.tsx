import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { StyleSheet, Text, type TextInput } from 'react-native';
import AnimatedMessage from '../components/AnimatedMessage';
import AppButton from '../components/AppButton';
import AuthFooterLink from '../components/AuthFooterLink';
import AuthScreenLayout from '../components/AuthScreenLayout';
import FadeInUp from '../components/FadeInUp';
import FormField from '../components/FormField';
import type { AuthStackParamList } from '../navigation/types';
import { DEMO_PASSWORD, DEMO_USER_EMAIL } from '../services/mockApi';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hasErrors, validateLogin, type LoginValues } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const INITIAL_VALUES: LoginValues = { email: '', password: '' };

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const login = useAuthStore((state) => state.login);
  const [values, setValues] = useState<LoginValues>(INITIAL_VALUES);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  // Errors stay hidden until the first submit, then track every keystroke.
  const errors = hasSubmitted ? validateLogin(values) : {};

  const updateField = (field: keyof LoginValues) => (text: string) => {
    setValues((current) => ({ ...current, [field]: text }));
    setFormError(null);
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (hasErrors(validateLogin(values))) return;
    // Success flips isLoggedIn; RootNavigator then swaps to the tabs, which open on EventsList.
    const result = login(values.email, values.password);
    if (!result.ok) setFormError(result.error);
  };

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Log in to find hackathons, pitch nights and founder meetups near you."
      footerIndex={6}
      footer={
        <AuthFooterLink prompt="New here?" action="Create an account" onPress={() => navigation.navigate('Signup')} />
      }
    >
      <AnimatedMessage message={formError} variant="banner" />

      <FadeInUp index={3}>
        <FormField
          label="Email"
          value={values.email}
          onChangeText={updateField('email')}
          error={errors.email}
          placeholder="you@startup.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
      </FadeInUp>

      <FadeInUp index={4}>
        <FormField
          ref={passwordRef}
          label="Password"
          value={values.password}
          onChangeText={updateField('password')}
          error={errors.password}
          placeholder="At least 8 characters"
          isPassword
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      </FadeInUp>

      <FadeInUp index={5}>
        <AppButton label="Log In" onPress={handleSubmit} />
        <Text style={[typography.caption, styles.hint, { color: colors.textSecondary }]}>
          Demo: {DEMO_USER_EMAIL} / {DEMO_PASSWORD}
        </Text>
      </FadeInUp>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  hint: { textAlign: 'center', marginTop: spacing.md },
});
