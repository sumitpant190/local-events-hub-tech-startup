import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import type { ComponentProps } from 'react';
import { springs } from '../theme/motion';

type TabBarIconProps = {
  name: ComponentProps<typeof Ionicons>['name'];
  color: string;
  size: number;
  focused: boolean;
};

export default function TabBarIcon({ name, color, size, focused }: TabBarIconProps) {
  return (
    <MotiView
      animate={{ scale: focused ? 1.12 : 1, translateY: focused ? -1 : 0 }}
      transition={springs.press}
    >
      <Ionicons name={name} size={size} color={color} />
    </MotiView>
  );
}
