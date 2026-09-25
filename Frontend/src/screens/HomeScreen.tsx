import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

// Placeholder until the events feed lands in a later phase.
export default function HomeScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 18 }}
      >
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Local Events Hub</Text>
        <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary }]}>
          Tech & startup events near you. Coming soon.
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
});
