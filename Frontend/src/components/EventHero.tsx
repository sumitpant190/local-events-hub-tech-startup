import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { EventCategory } from '../services/types';
import { useThemeColors, withAlpha } from '../theme/colors';
import { springs } from '../theme/motion';
import { CATEGORY_ICONS } from '../utils/categoryIcons';

type EventHeroProps = {
  category: EventCategory;
  /** Scroll offset of the parent ScrollView, drives parallax and pull-down stretch. */
  scrollY: SharedValue<number>;
};

export const HERO_HEIGHT = 260;
const ICON_SIZE = 76;
const GLOW_SIZE = HERO_HEIGHT * 1.4;
const PARALLAX_FACTOR = 0.5;
const MAX_STRETCH_SCALE = 2;

// Placeholder "image": category icon on layered brand glows, until events carry real photos.
export default function EventHero({ category, scrollY }: EventHeroProps) {
  const colors = useThemeColors();

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-HERO_HEIGHT, 0, HERO_HEIGHT],
          [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * PARALLAX_FACTOR],
        ),
      },
      { scale: interpolate(scrollY.value, [-HERO_HEIGHT, 0], [MAX_STRETCH_SCALE, 1], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View style={[styles.hero, { backgroundColor: withAlpha(colors.primary, 0.2) }, heroStyle]}>
      <View style={[styles.glow, styles.glowTop, { backgroundColor: withAlpha(colors.primary, 0.35) }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: withAlpha(colors.accent, 0.18) }]} />
      <MotiView
        from={{ opacity: 0, scale: 0.6, rotate: '-12deg' }}
        animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
        transition={{ ...springs.entrance, delay: 120 }}
      >
        <Ionicons name={CATEGORY_ICONS[category]} size={ICON_SIZE} color={colors.textPrimary} />
      </MotiView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: { position: 'absolute', width: GLOW_SIZE, height: GLOW_SIZE, borderRadius: GLOW_SIZE / 2 },
  glowTop: { top: -GLOW_SIZE / 2, right: -GLOW_SIZE / 3 },
  glowBottom: { bottom: -GLOW_SIZE / 1.6, left: -GLOW_SIZE / 3 },
});
