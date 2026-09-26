import { MotiView } from 'moti';
import { useState, type ReactNode } from 'react';
import { Pressable, type AccessibilityState, type StyleProp, type ViewStyle } from 'react-native';
import { PRESSED_SCALE, springs } from '../theme/motion';

type PressableScaleProps = {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  /** Scale while held; large surfaces like cards look better with a subtler value. */
  pressedScale?: number;
  disabled?: boolean;
};

const DISABLED_OPACITY = 0.5;

// Spring scale-down on press; base for every tappable card and button.
export default function PressableScale({
  onPress,
  children,
  style,
  accessibilityLabel,
  accessibilityState,
  pressedScale = PRESSED_SCALE,
  disabled = false,
}: PressableScaleProps) {
  const [isPressed, setIsPressed] = useState(false);
  const opacity = disabled ? DISABLED_OPACITY : isPressed ? 0.9 : 1;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled }}
    >
      <MotiView
        animate={{ scale: isPressed ? pressedScale : 1, opacity }}
        transition={springs.press}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
