import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, withAlpha } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import BackgroundGlow from './BackgroundGlow';
import FadeInUp from './FadeInUp';

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  /** Form content rendered inside the card. Use FadeInUp with index >= 3 to continue the stagger. */
  children: ReactNode;
  footer: ReactNode;
  /** Stagger index for the footer, after the card's own fields. */
  footerIndex: number;
};

export default function AuthScreenLayout({ title, subtitle, children, footer, footerIndex }: AuthScreenLayoutProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BackgroundGlow />
      <SafeAreaView style={styles.root}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FadeInUp index={0}>
              <View style={[styles.eyebrow, { backgroundColor: withAlpha(colors.accent, 0.12), borderColor: withAlpha(colors.accent, 0.4) }]}>
                <Text style={[typography.label, styles.eyebrowText, { color: colors.accent }]}>TECH & STARTUP</Text>
              </View>
            </FadeInUp>

            <FadeInUp index={1}>
              <Text style={[typography.display, { color: colors.textPrimary }]}>{title}</Text>
              <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            </FadeInUp>

            <FadeInUp
              index={2}
              style={[styles.card, { backgroundColor: withAlpha(colors.surface, 0.92), borderColor: colors.border }]}
            >
              {children}
            </FadeInUp>

            <FadeInUp index={footerIndex} style={styles.footer}>
              {footer}
            </FadeInUp>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  eyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  eyebrowText: { letterSpacing: 2 },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
});
