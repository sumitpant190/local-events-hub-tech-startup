import { MotiView } from 'moti';
import { useState, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { PRESSED_SCALE, springs } from '../theme/motion';

type PressableScaleProps = {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

// Spring scale-down on press; base for every tappable card and button.
export default function PressableScale({ onPress, children, style, accessibilityLabel }: PressableScaleProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <MotiView
        animate={{ scale: isPressed ? PRESSED_SCALE : 1, opacity: isPressed ? 0.9 : 1 }}
        transition={springs.press}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
