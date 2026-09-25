import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/colors';
import { springs } from '../theme/motion';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ScreenContainerProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

// Themed, safe-area-aware screen shell with a spring entrance.
export default function ScreenContainer({ title, subtitle, children }: ScreenContainerProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <MotiView
        style={styles.content}
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={springs.entrance}
      >
        <Text style={[typography.h1, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </MotiView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: spacing.xl },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
});
