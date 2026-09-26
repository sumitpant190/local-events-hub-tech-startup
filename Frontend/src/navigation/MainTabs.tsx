import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/TabBarIcon';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import EventsStack from './EventsStack';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: typography.tabLabel,
      }}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{
          title: 'Events',
          tabBarIcon: (props) => <TabBarIcon name="calendar-outline" {...props} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: (props) => <TabBarIcon name="person-outline" {...props} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: (props) => <TabBarIcon name="settings-outline" {...props} /> }}
      />
    </Tab.Navigator>
  );
}
