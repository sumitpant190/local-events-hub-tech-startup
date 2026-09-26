import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeInUp from '../components/FadeInUp';
import InfoRow from '../components/InfoRow';
import SettingsGroup from '../components/SettingsGroup';
import SpringSwitch from '../components/SpringSwitch';
import type { MainTabParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useThemeScheme } from '../theme/themeContext';
import { typography } from '../theme/typography';
import type { IconName } from '../utils/categoryIcons';

type Props = BottomTabScreenProps<MainTabParamList, 'Settings'>;

type NotificationKey = 'reminders' | 'comments' | 'digest';

const NOTIFICATION_OPTIONS: { key: NotificationKey; icon: IconName; title: string; subtitle: string }[] = [
  { key: 'reminders', icon: 'alarm-outline', title: 'Event reminders', subtitle: 'A nudge the day before events you RSVP to' },
  { key: 'comments', icon: 'chatbubbles-outline', title: 'Comment replies', subtitle: 'When someone replies on an event you follow' },
  { key: 'digest', icon: 'newspaper-outline', title: 'Weekly digest', subtitle: 'New hackathons and meetups every Monday' },
];

export default function SettingsScreen(_props: Props) {
  const colors = useThemeColors();
  const { scheme, setScheme } = useThemeScheme();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  // UI only for now: nothing is sent anywhere until push notifications exist.
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    reminders: true,
    comments: true,
    digest: false,
  });

  const isDark = scheme === 'dark';

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInUp index={0}>
          <Text style={[typography.h1, styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </FadeInUp>

        <FadeInUp index={1}>
          <SettingsGroup title="Appearance">
            <InfoRow
              icon={isDark ? 'moon-outline' : 'sunny-outline'}
              title="Dark mode"
              subtitle={isDark ? 'Easy on the eyes at late-night hackathons' : 'Using the light theme'}
              right={
                <SpringSwitch
                  value={isDark}
                  onValueChange={(isOn) => setScheme(isOn ? 'dark' : 'light')}
                  accessibilityLabel="Dark mode"
                />
              }
            />
          </SettingsGroup>
        </FadeInUp>

        <FadeInUp index={2}>
          <SettingsGroup title="Notifications">
            {NOTIFICATION_OPTIONS.map((option) => (
              <InfoRow
                key={option.key}
                icon={option.icon}
                title={option.title}
                subtitle={option.subtitle}
                right={
                  <SpringSwitch
                    value={notifications[option.key]}
                    onValueChange={(isOn) => setNotifications((current) => ({ ...current, [option.key]: isOn }))}
                    accessibilityLabel={option.title}
                  />
                }
              />
            ))}
          </SettingsGroup>
        </FadeInUp>

        <FadeInUp index={3}>
          <SettingsGroup title="Account">
            <InfoRow icon="person-circle-outline" title={currentUser?.name ?? 'Signed in'} subtitle={currentUser?.email} />
          </SettingsGroup>
          {/* Clearing auth flips RootNavigator back to the Auth stack with its "pop" transition. */}
          <AppButton label="Log out" variant="danger" onPress={logout} />
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { marginBottom: spacing.xl },
});
