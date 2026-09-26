import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CommentResult } from '../store/commentsStore';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MAX_COMMENT_LENGTH, sanitizeComment } from '../utils/sanitize';
import AnimatedMessage from './AnimatedMessage';
import Avatar from './Avatar';
import PressableScale from './PressableScale';

type CommentInputProps = {
  authorName: string;
  isPosting: boolean;
  onSubmit: (text: string) => Promise<CommentResult>;
};

const AVATAR_SIZE = 32;
const SEND_SIZE = 40;
const SEND_ICON_SIZE = 20;
const COUNTER_WARNING_AT = 20;
const MAX_INPUT_HEIGHT = 120;

export default function CommentInput({ authorName, isPosting, onSubmit }: CommentInputProps) {
  const colors = useThemeColors();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const remaining = MAX_COMMENT_LENGTH - text.length;
  const canSend = !isPosting && sanitizeComment(text).length > 0;

  const handleChange = (value: string) => {
    setText(value);
    setError(null);
  };

  const handleSend = async () => {
    const result = await onSubmit(text);
    if (result.ok) {
      setText('');
    } else {
      setError(result.error);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <Avatar name={authorName} size={AVATAR_SIZE} isHighlighted />
        <MotiView
          animate={{
            borderColor: isFocused ? colors.primary : colors.border,
            backgroundColor: isFocused ? colors.surfaceElevated : colors.surface,
          }}
          transition={{ type: 'timing', duration: 180 }}
          style={styles.inputWrap}
        >
          <TextInput
            value={text}
            onChangeText={handleChange}
            placeholder="Ask a question or share a thought…"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.primary}
            accessibilityLabel="Write a comment"
            multiline
            maxLength={MAX_COMMENT_LENGTH}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[typography.body, styles.input, { color: colors.textPrimary }]}
          />
        </MotiView>
        <PressableScale
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Post comment"
          style={[styles.send, { backgroundColor: colors.primary }]}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons name="arrow-up" size={SEND_ICON_SIZE} color={colors.onPrimary} />
          )}
        </PressableScale>
      </View>

      <View style={styles.footer}>
        <View style={styles.message}>
          <AnimatedMessage message={error} />
        </View>
        <Text
          style={[typography.caption, { color: remaining <= COUNTER_WARNING_AT ? colors.error : colors.textSecondary }]}
          accessibilityLabel={`${remaining} characters left`}
        >
          {remaining}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  inputWrap: { flex: 1, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  input: { maxHeight: MAX_INPUT_HEIGHT, paddingVertical: spacing.sm, textAlignVertical: 'top' },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs },
  message: { flex: 1 },
});
