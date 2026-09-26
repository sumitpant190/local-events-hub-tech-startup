import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useThemeColors } from '../theme/colors';
import { springs } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import PressableScale from './PressableScale';

type RsvpButtonProps = {
  isGoing: boolean;
  isFull: boolean;
  onPress: () => void;
};

const POP_SCALE = 1.1;
const POP_SPRING = { damping: 9, stiffness: 320 };
const COLOR_MS = 260;
const ICON_SIZE = 20;

export default function RsvpButton({ isGoing, isFull, onPress }: RsvpButtonProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const previousIsGoing = useRef(isGoing);
  const isDisabled = isFull && !isGoing;

  // Pop only when the RSVP state actually flips, not on first render.
  useEffect(() => {
    if (previousIsGoing.current === isGoing) return;
    previousIsGoing.current = isGoing;
    scale.value = withSequence(withSpring(POP_SCALE, POP_SPRING), withSpring(1, POP_SPRING));
  }, [isGoing, scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const label = isGoing ? "You're going" : isFull ? 'Event full' : 'RSVP';
  const contentColor = isGoing ? colors.onPrimary : colors.textPrimary;

  return (
    <Animated.View style={popStyle}>
      <PressableScale
        onPress={onPress}
        disabled={isDisabled}
        accessibilityLabel={isGoing ? 'Cancel RSVP' : 'RSVP to this event'}
        accessibilityState={{ selected: isGoing }}
      >
        <MotiView
          animate={{
            backgroundColor: isGoing ? colors.primary : colors.surface,
            borderColor: isGoing ? colors.primary : colors.border,
          }}
          transition={{ type: 'timing', duration: COLOR_MS }}
          style={styles.button}
        >
          {/* Remounts on toggle so the icon spins in fresh each time. */}
          <MotiView
            key={String(isGoing)}
            from={{ scale: 0.4, rotate: '-90deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            transition={springs.press}
          >
            <Ionicons
              name={isGoing ? 'checkmark-circle' : isFull ? 'close-circle-outline' : 'add-circle-outline'}
              size={ICON_SIZE}
              color={contentColor}
            />
          </MotiView>
          <Text style={[typography.bodyStrong, { color: contentColor }]}>{label}</Text>
        </MotiView>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
