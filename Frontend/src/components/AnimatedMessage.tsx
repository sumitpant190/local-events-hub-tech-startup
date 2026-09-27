import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type AnimatedMessageProps = {
  message?: string | null;
  variant?: 'inline' | 'banner';
  /** Errors by default; 'success' for confirmations such as "Account created". */
  tone?: 'error' | 'success';
};

const MESSAGE_ANIMATION_MS = 200;

// Slides/fades an error in and out, animating to its measured height so nothing jumps.
export default function AnimatedMessage({ message, variant = 'inline', tone = 'error' }: AnimatedMessageProps) {
  const colors = useThemeColors();
  const [displayed, setDisplayed] = useState(message ?? '');
  const [contentHeight, setContentHeight] = useState(0);
  const isVisible = Boolean(message);

  // Keep the last text while animating out instead of blanking it mid-transition.
  useEffect(() => {
    if (message) setDisplayed(message);
  }, [message]);

  const isBanner = variant === 'banner';
  // Success reuses the primary tint pair, which is contrast-checked in both themes.
  const palette =
    tone === 'success'
      ? { text: colors.primary, tint: colors.primaryTint, border: colors.primaryBorder }
      : { text: colors.errorText, tint: colors.errorTint, border: colors.errorBorder };

  return (
    <MotiView
      animate={{
        height: isVisible ? contentHeight : 0,
        opacity: isVisible ? 1 : 0,
        translateY: isVisible ? 0 : -4,
      }}
      transition={{ type: 'timing', duration: MESSAGE_ANIMATION_MS }}
      style={styles.clip}
    >
      <View
        style={styles.measure}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[
            isBanner ? typography.label : typography.caption,
            { color: palette.text },
            isBanner && [styles.banner, { backgroundColor: palette.tint, borderColor: palette.border }],
            !isBanner && styles.inline,
          ]}
        >
          {displayed}
        </Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  measure: { position: 'absolute', left: 0, right: 0, top: 0 },
  inline: { paddingTop: spacing.xs },
  banner: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
});
