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
};

// Spring scale-down on press; base for every tappable card and button.
export default function PressableScale({
  onPress,
  children,
  style,
  accessibilityLabel,
  accessibilityState,
  pressedScale = PRESSED_SCALE,
}: PressableScaleProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      <MotiView
        animate={{ scale: isPressed ? pressedScale : 1, opacity: isPressed ? 0.9 : 1 }}
        transition={springs.press}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
