import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  /** `signedUpEmail` is set after a successful signup: prefill it and confirm the account was created. */
  Login: { signedUpEmail?: string } | undefined;
  Signup: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string; title: string };
};

export type MainTabParamList = {
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
