import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CapacityBarProps = {
  attendeeCount: number;
  capacity: number;
};

const BAR_HEIGHT = 6;
// Above this share of seats taken the fill switches to the accent color as a "filling up" cue.
const FILLING_UP_RATIO = 0.85;

export default function CapacityBar({ attendeeCount, capacity }: CapacityBarProps) {
  const colors = useThemeColors();
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = capacity > 0 ? Math.min(attendeeCount / capacity, 1) : 0;
  const spotsLeft = Math.max(capacity - attendeeCount, 0);

  return (
    <View style={styles.container}>
      <View
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={[styles.track, { backgroundColor: colors.surfaceElevated }]}
      >
        <MotiView
          animate={{
            width: trackWidth * ratio,
            backgroundColor: ratio >= FILLING_UP_RATIO ? colors.accent : colors.primary,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 140 }}
          style={styles.fill}
        />
      </View>
      <Text style={[typography.caption, styles.caption, { color: colors.textSecondary }]}>
        {spotsLeft > 0 ? `${spotsLeft} of ${capacity} spots left` : `Full · ${capacity} spots taken`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  track: { height: BAR_HEIGHT, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: BAR_HEIGHT, borderRadius: radius.pill },
  caption: { marginTop: spacing.xs },
});
