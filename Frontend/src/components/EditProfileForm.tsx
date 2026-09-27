import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { User } from '../services/types';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hasErrors, validateProfile, type ProfileValues } from '../utils/validation';
import AnimatedMessage from './AnimatedMessage';
import AppButton from './AppButton';
import FormField from './FormField';

type EditProfileFormProps = {
  user: User;
  onDone: () => void;
};

export default function EditProfileForm({ user, onDone }: EditProfileFormProps) {
  const colors = useThemeColors();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [values, setValues] = useState<ProfileValues>({ name: user.name });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isSaving = useRef(false);

  const errors = hasSubmitted ? validateProfile(values) : {};

  const updateField = (field: keyof ProfileValues) => (text: string) => {
    setValues((current) => ({ ...current, [field]: text }));
    setFormError(null);
  };

  const handleSave = async () => {
    setHasSubmitted(true);
    if (isSaving.current || hasErrors(validateProfile(values))) return;
    isSaving.current = true;
    const result = await updateProfile(values);
    isSaving.current = false;
    if (result.ok) {
      onDone();
    } else {
      setFormError(result.error);
    }
  };

  return (
    <View>
      <AnimatedMessage message={formError} variant="banner" />
      <FormField
        label="Name"
        value={values.name}
        onChangeText={updateField('name')}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      {/* Email is the login identifier, so it isn't editable here. */}
      <Text style={[typography.label, { color: colors.textSecondary }]}>Email</Text>
      <Text style={[typography.body, styles.email, { color: colors.textPrimary }]}>{user.email}</Text>

      <AppButton label="Save changes" onPress={handleSave} />
      <AppButton label="Cancel" variant="ghost" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  email: { marginTop: spacing.xs, marginBottom: spacing.sm },
});
