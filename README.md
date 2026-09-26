# Local Events Hub

A mobile app for discovering local events. University group project, theme: **Tech & Startup**.

- `Frontend/` — React Native app (Expo managed workflow, TypeScript)
- `Backend/` — Firebase on the free Spark plan: Firestore security rules, emulator config, seed scripts, rules tests
- `GIT_HISTORY.md` — phase-by-phase development log

## Tech stack

React Native + Expo · React Navigation (native stack) · Zustand · Axios · react-native-reanimated + moti · Space Grotesk / Inter (via `@expo-google-fonts`)

## Setup Guide

### Prerequisites

- Node.js 20 or newer
- Git
- The **Expo Go** app on your phone, or an Android emulator / iOS simulator

### Install and run

```bash
git clone <repo-url>
cd "Tech & Startup/Frontend"
npm install
npm start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS). Or press `a` for an Android emulator, `i` for an iOS simulator, or `w` for web.

### Useful scripts (run inside `Frontend/`)

| Command | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` / `npm run ios` / `npm run web` | Start and open on a platform |
| `npm run typecheck` | TypeScript check |

> **Windows note:** the folder name contains `&`, which breaks `npx` and npm's `.bin` shims on Windows. The npm scripts call the Expo CLI through `node` directly, so use `npm start` instead of `npx expo start`. To add packages, run `node node_modules/expo/bin/cli install <pkg>`.

### Mock data vs. real API

The app runs against an in-memory mock backend by default. To point it at a real server, copy `Frontend/.env.example` to `Frontend/.env`, set `EXPO_PUBLIC_USE_MOCK_DATA=false` and `EXPO_PUBLIC_API_URL`, then restart `npm start`. No screen or store changes are needed: every call goes through `src/services/*Service.ts`, which picks the mock or the Axios client (`src/services/api.ts`).

API contract the backend must follow (every response is `{ success, data, error }`, authenticated calls send `Authorization: Bearer <token>`):

| Method | Path | Returns |
|---|---|---|
| POST | `/auth/login` `{ email, password }` | `{ token, user }` |
| POST | `/auth/signup` `{ name, email, password }` | `{ token, user }` |
| PATCH | `/users/me` `{ name, headline }` | `User` |
| GET | `/users/:id` | `{ id, name, headline }` |
| GET | `/events` | `EventItem[]` |
| GET | `/me/rsvps` | `string[]` (event ids) |
| PUT | `/events/:id/rsvp` `{ isGoing }` | `{ eventId, isGoing, attendeeCount }` |
| GET | `/events/:id/attendees?limit=N` | `{ id, name, headline }[]` |
| GET | `/events/:id/comments` | comments, newest first, each with `author` |
| POST | `/events/:id/comments` `{ body }` | the created comment with `author` |

A `401` from any authenticated call signs the user out; `401` from login/signup is shown as a normal error.

`EventItem.location.coordinates` (`{ latitude, longitude }`) is optional; EventDetails shows a map card only when it is present. Maps work in Expo Go as-is; a standalone Android release build additionally needs a Google Maps API key in `app.json` (`android.config.googleMaps.apiKey`).

The events list is cached on the device (AsyncStorage, public event data only). If a refresh fails, the app keeps showing the cached list with an "offline" banner and a Retry button; pull down to refresh.

### Project structure

```
Frontend/
  App.tsx              font loading, splash, root navigator
  src/
    screens/           one file per screen
    components/        reusable UI pieces
    navigation/        React Navigation stacks
    store/             Zustand stores
    services/          API layer (Axios)
    theme/             colors, typography, spacing (single source of truth)
    assets/            images, icons
    utils/             helpers
```

All colors, fonts and spacing must come from `src/theme/`. Don't put inline hex values in screens or components.

## Backend Setup Guide

The backend is Firebase on the free **Spark** plan only: Firestore, Firebase Authentication (Email/Password) and Security Rules. There are no Cloud Functions and no custom server. The app talks to Firestore directly, so `Backend/firestore.rules` is the access-control layer. Nothing here needs the Blaze plan or billing.

### Prerequisites

- Node.js 22.18 or newer (the scripts are TypeScript run directly by Node, with no build step)
- Java 21 or newer (the Firestore emulator runs on the JVM)

### Run the emulators

```bash
cd "Tech & Startup/Backend"
npm install
npm run emulators
```

This starts the Auth emulator (`127.0.0.1:9099`), the Firestore emulator (`127.0.0.1:8080`) and the Emulator UI at http://127.0.0.1:4000. The emulator scripts always use the project `demo-local-events-hub`, even though `.firebaserc` points to the real project. `demo-` projects run entirely locally, need no `firebase login`, and can't reach real Firebase services.

> **Windows note:** as with the frontend, the `&` in the folder name breaks npm's `.bin` shims, so use `npm run emulators` or `npm run firebase -- <command>` rather than `npx firebase ...`.

### Seed the emulators

With the emulators running, in a second terminal:

```bash
npm run seed:emulator
```

This wipes the emulators, then creates 4 users (Auth accounts and `users` docs), 12 events, plus RSVPs and comments. Every seeded account signs in with the password `startup123` (for example `maya@loopdesk.io`). Emulator data is in memory, so re-run the seed after each emulator restart.

The script only ever targets the emulators. It refuses to run if:
- the project isn't a `demo-` project;
- `FIRESTORE_EMULATOR_HOST` or `FIREBASE_AUTH_EMULATOR_HOST` points anywhere other than this machine;
- `GOOGLE_APPLICATION_CREDENTIALS` is set.

It needs no service account key.

| Script | What it does |
|---|---|
| `npm run emulators` | Start the Auth + Firestore emulators and the Emulator UI |
| `npm run seed:emulator` | Wipe and re-seed the emulators |
| `npm test` | Unit tests (no emulator needed) |
| `npm run test:emulator` | Start throwaway emulators, run the emulator tests (signup flow + security rules), stop them |
| `npm run typecheck` | TypeScript check |

### Link the real Firebase project (Spark plan)

1. In the [Firebase Console](https://console.firebase.google.com), create a project. It starts on Spark. Don't upgrade it or add billing.
2. **Build → Firestore Database → Create database**, and choose **production mode** (deny all), not test mode.
3. **Build → Authentication → Sign-in method**, and enable **Email/Password**.
4. Link it locally: `npm run firebase -- login`, then `npm run firebase -- use --add` and pick the project.

### Secrets: what's safe to commit

- **Safe (not a secret):** the client-side Firebase config (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) from **Project Settings → Your apps**. It only identifies the project and ships inside the app. Access is enforced by `firestore.rules` and Firebase Auth, not by keeping this config hidden.
- **Secret (never commit):** a **service account key** (`serviceAccountKey.json`). It grants full admin access and bypasses all security rules. Nothing in this repo needs one (the seed script runs against the emulator with no credentials), and `Backend/.gitignore` blocks `*serviceAccountKey*.json` and `.env*` in case one is ever downloaded.

### Signup contract (client-side)

**Every signup screen must follow this.** Signup and login run entirely in the app through the Firebase Auth SDK, which hashes and salts passwords, so there's nothing to build for that. On the Spark plan there's no Auth trigger (that needs Cloud Functions), so **the app itself must create the user's profile document**:

1. Call `createUserWithEmailAndPassword(auth, email, password)`.
2. **Immediately after it succeeds, in the same signup function**, create `users/{uid}` (with `uid` from the returned credential) containing exactly:

   | Field | Value |
   |---|---|
   | `name` | the entered name, trimmed (1–80 characters) |
   | `email` | `credential.user.email` (the account's own email) |
   | `role` | **the literal `"attendee"`. Hardcode it; never take it from a form field, route param or any other input** |
   | `avatarUrl` | `""` |

3. If the profile write fails, delete the just-created Auth user (`deleteUser(credential.user)`) and show the error. Otherwise the account exists with no profile, and the email is "taken" forever.
4. Log in with `signInWithEmailAndPassword`. The profile already exists, so there's nothing else to write.

The reference implementation is `Backend/src/signUp.ts`. Use it as-is in the app. `firestore.rules` enforces the same contract server-side, so a modified or hand-crafted client is rejected if it tries to:
- create a profile for another uid;
- use any role other than `attendee`;
- add extra fields;
- use an email that isn't the account's own;
- use a blank or over-long name;
- overwrite an existing profile.

`Backend/tests/signup.emulator.test.ts` checks each of these (`npm run test:emulator`).

### Promoting a user to organizer or admin

Everyone signs up as `attendee`. The Spark plan has no admin Cloud Function, so for testing and demos, promote a user by hand:

- **Real project:** open the [Firebase Console](https://console.firebase.google.com) → **Firestore Database**, open `users/{userId}`, change the `role` field to `organizer` or `admin`, and save.
- **Emulators:** do the same in the Emulator UI at http://127.0.0.1:4000/firestore.

Console and Emulator UI edits go through the Admin API, so they aren't blocked by the rules that stop users from changing their own role. The user's app picks up the new role the next time it reads their profile.
