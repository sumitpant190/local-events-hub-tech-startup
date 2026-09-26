import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { timings } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import AnimatedMessage from './AnimatedMessage';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  /** Masks input and shows a show/hide toggle. */
  isPassword?: boolean;
  ref?: Ref<TextInput>;
};

const ICON_SIZE = 20;

export default function FormField({ label, error, isPassword = false, ref, onFocus, onBlur, ...inputProps }: FormFieldProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isMasked, setIsMasked] = useState(true);

  const borderColor = error ? colors.error : isFocused ? colors.primary : colors.border;

  return (
    <View style={styles.field}>
      <Text style={[typography.label, styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <MotiView
        animate={{
          borderColor,
          backgroundColor: isFocused ? colors.surfaceElevated : colors.background,
        }}
        transition={timings.colorShift}
        style={styles.inputWrap}
      >
        <TextInput
          ref={ref}
          {...inputProps}
          accessibilityLabel={label}
          secureTextEntry={isPassword && isMasked}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          style={[typography.body, styles.input, { color: colors.textPrimary }]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setIsMasked((masked) => !masked)}
            hitSlop={spacing.md}
            accessibilityRole="button"
            accessibilityLabel={isMasked ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={isMasked ? 'eye-outline' : 'eye-off-outline'} size={ICON_SIZE} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </MotiView>
      <AnimatedMessage message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: spacing.md },
});
