import { MotiView } from 'moti';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { timings } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';

type SpringSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const PADDING = 3;
const THUMB_SIZE = TRACK_HEIGHT - PADDING * 2;
// While pressed the thumb stretches toward the side it's about to travel to.
const THUMB_STRETCH = 6;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;
const THUMB_SPRING = { type: 'spring', damping: 14, stiffness: 260, mass: 0.7 } as const;

export default function SpringSwitch({ value, onValueChange, accessibilityLabel }: SpringSwitchProps) {
  const colors = useThemeColors();
  const [isPressed, setIsPressed] = useState(false);
  const stretch = isPressed ? THUMB_STRETCH : 0;

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      hitSlop={spacing.sm}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
    >
      <MotiView
        animate={{
          backgroundColor: value ? colors.primary : colors.surfaceElevated,
          borderColor: value ? colors.primary : colors.border,
        }}
        transition={timings.colorShift}
        style={styles.track}
      >
        <MotiView
          animate={{
            width: THUMB_SIZE + stretch,
            // When on, shift left by the stretch so the thumb grows toward the center, not past the edge.
            translateX: value ? TRAVEL - stretch : 0,
            backgroundColor: value ? colors.onPrimary : colors.textSecondary,
          }}
          transition={THUMB_SPRING}
          style={styles.thumb}
        />
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: PADDING - 1,
    justifyContent: 'center',
  },
  thumb: { height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2 },
});
