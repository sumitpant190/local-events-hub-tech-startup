import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const ICON_SIZE = 18;

export default function SearchBar({ value, onChangeText, placeholder = 'Search events' }: SearchBarProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const hasText = value.length > 0;

  return (
    <MotiView
      animate={{
        borderColor: isFocused ? colors.primary : colors.border,
        backgroundColor: isFocused ? colors.surfaceElevated : colors.surface,
      }}
      transition={{ type: 'timing', duration: 180 }}
      style={styles.container}
    >
      <Ionicons name="search-outline" size={ICON_SIZE} color={isFocused ? colors.primary : colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        accessibilityLabel="Search events by title"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[typography.body, styles.input, { color: colors.textPrimary }]}
      />
      <MotiView
        animate={{ opacity: hasText ? 1 : 0, scale: hasText ? 1 : 0.6 }}
        transition={{ type: 'timing', duration: 150 }}
        pointerEvents={hasText ? 'auto' : 'none'}
      >
        <Pressable onPress={() => onChangeText('')} hitSlop={spacing.md} accessibilityRole="button" accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={ICON_SIZE} color={colors.textSecondary} />
        </Pressable>
      </MotiView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: spacing.md },
});
