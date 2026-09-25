import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import EventsListScreen from '../screens/EventsListScreen';
import { stackScreenOptions } from './stackOptions';
import type { EventsStackParamList } from './types';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="EventsList" component={EventsListScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}
