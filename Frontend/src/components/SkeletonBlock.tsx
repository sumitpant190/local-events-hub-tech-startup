import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors, withAlpha } from '../theme/colors';
import { radius as radii } from '../theme/spacing';

type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const SHIMMER_MS = 1200;
const BAND_RATIO = 0.6;
// Three soft steps fake a gradient highlight without pulling in a gradient library.
const BAND_ALPHAS = [0.03, 0.07, 0.03];

export default function SkeletonBlock({ height, width = '100%', radius = radii.sm, style }: SkeletonBlockProps) {
  const colors = useThemeColors();
  const [trackWidth, setTrackWidth] = useState(0);
  const bandWidth = trackWidth * BAND_RATIO;

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.block, { height, width, borderRadius: radius, backgroundColor: colors.surfaceElevated }, style]}
    >
      {trackWidth > 0 ? (
        <MotiView
          from={{ translateX: -bandWidth }}
          animate={{ translateX: trackWidth }}
          transition={{ type: 'timing', duration: SHIMMER_MS, loop: true, repeatReverse: false }}
          style={[styles.band, { width: bandWidth }]}
        >
          {BAND_ALPHAS.map((alpha, index) => (
            <View key={index} style={[styles.step, { backgroundColor: withAlpha(colors.textPrimary, alpha) }]} />
          ))}
        </MotiView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { overflow: 'hidden' },
  band: { position: 'absolute', top: 0, bottom: 0, flexDirection: 'row' },
  step: { flex: 1 },
});
