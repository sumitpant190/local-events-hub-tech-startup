import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { STAGGER_MS, springs } from '../theme/motion';

type FadeInUpProps = {
  /** Position in the stagger sequence; each step adds STAGGER_MS of delay. */
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function FadeInUp({ index = 0, children, style }: FadeInUpProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        ...springs.entrance,
        delay: index * STAGGER_MS,
        opacity: { type: 'timing', duration: 320, delay: index * STAGGER_MS },
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
