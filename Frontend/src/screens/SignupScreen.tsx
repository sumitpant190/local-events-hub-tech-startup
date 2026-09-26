import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import AnimatedMessage from '../components/AnimatedMessage';
import AppButton from '../components/AppButton';
import AuthFooterLink from '../components/AuthFooterLink';
import AuthScreenLayout from '../components/AuthScreenLayout';
import FadeInUp from '../components/FadeInUp';
import FormField from '../components/FormField';
import type { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { hasErrors, MIN_PASSWORD_LENGTH, validateSignup, type SignupValues } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const INITIAL_VALUES: SignupValues = { name: '', email: '', password: '', confirmPassword: '' };

export default function SignupScreen({ navigation }: Props) {
  const signup = useAuthStore((state) => state.signup);
  const [values, setValues] = useState<SignupValues>(INITIAL_VALUES);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // Errors stay hidden until the first submit, then track every keystroke.
  const errors = hasSubmitted ? validateSignup(values) : {};

  const updateField = (field: keyof SignupValues) => (text: string) => {
    setValues((current) => ({ ...current, [field]: text }));
    setFormError(null);
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (hasErrors(validateSignup(values))) return;
    const result = signup(values.name, values.email, values.password);
    if (!result.ok) setFormError(result.error);
  };

  return (
    <AuthScreenLayout
      title="Join the hub"
      subtitle="Create an account to RSVP, save events and meet other builders."
      footerIndex={8}
      footer={
        <AuthFooterLink prompt="Already have an account?" action="Log in" onPress={() => navigation.navigate('Login')} />
      }
    >
      <AnimatedMessage message={formError} variant="banner" />

      <FadeInUp index={3}>
        <FormField
          label="Full name"
          value={values.name}
          onChangeText={updateField('name')}
          error={errors.name}
          placeholder="Ada Lovelace"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          submitBehavior="submit"
        />
      </FadeInUp>

      <FadeInUp index={4}>
        <FormField
          ref={emailRef}
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

      <FadeInUp index={5}>
        <FormField
          ref={passwordRef}
          label="Password"
          value={values.password}
          onChangeText={updateField('password')}
          error={errors.password}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          submitBehavior="submit"
        />
      </FadeInUp>

      <FadeInUp index={6}>
        <FormField
          ref={confirmRef}
          label="Confirm password"
          value={values.confirmPassword}
          onChangeText={updateField('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="Type it again"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      </FadeInUp>

      <FadeInUp index={7}>
        <AppButton label="Create Account" onPress={handleSubmit} />
      </FadeInUp>
    </AuthScreenLayout>
  );
}
