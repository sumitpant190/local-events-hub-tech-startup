import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

// moti's entry eagerly builds MotiSafeAreaView from React Native's deprecated SafeAreaView
// (moti/build/components/safe-area-view.js), which logs this on every load. We never use it;
// all our safe-area handling comes from react-native-safe-area-context.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
