import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Public client config from Firebase Console → Project settings → Your apps. Not a secret: it only
// identifies the project; access is enforced by Firebase Auth and Backend/firestore.rules.
const firebaseConfig = {
  apiKey: 'AIzaSyBv9VrnnjIvcYtvGDLqCd0kEvxR1FecHUI',
  authDomain: 'events-hub-techstartup.firebaseapp.com',
  projectId: 'events-hub-techstartup',
  storageBucket: 'events-hub-techstartup.firebasestorage.app',
  messagingSenderId: '1098542071237',
  appId: '1:1098542071237:web:8106cd20ddbed1f1e5dfac',
};

// Emulators are dev-only: a release build (__DEV__ false) always talks to production.
// In dev they're on by default; set EXPO_PUBLIC_USE_EMULATOR=false to use production from a dev build.
export const USE_EMULATOR = __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATOR !== 'false';

// The emulators run on the dev machine. Android emulators reach it at 10.0.2.2, iOS simulators and web
// at localhost; a physical device needs the machine's LAN IP via EXPO_PUBLIC_EMULATOR_HOST.
const EMULATOR_HOST =
  process.env.EXPO_PUBLIC_EMULATOR_HOST?.trim() || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const AUTH_EMULATOR_PORT = 9099;
const FIRESTORE_EMULATOR_PORT = 8080;

// The emulator project is the seeded demo-* project (see Backend/README), not the real one.
const app = initializeApp(USE_EMULATOR ? { ...firebaseConfig, projectId: 'demo-local-events-hub' } : firebaseConfig);

// AsyncStorage persistence keeps the user signed in across app restarts.
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);

if (USE_EMULATOR) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, { disableWarnings: true });
  connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
}
