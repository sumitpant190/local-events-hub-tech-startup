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

- Node.js 20 or newer
- Java 21 or newer (the Firestore emulator runs on the JVM)

### Run the emulators

```bash
cd "Tech & Startup/Backend"
npm install
npm run emulators
```

This starts the Auth emulator (`127.0.0.1:9099`), the Firestore emulator (`127.0.0.1:8080`) and the Emulator UI at http://127.0.0.1:4000. The default project is `demo-local-events-hub`: `demo-` projects run entirely locally, need no `firebase login`, and can't reach real Firebase services.

> **Windows note:** as with the frontend, the `&` in the folder name breaks npm's `.bin` shims, so use `npm run emulators` or `npm run firebase -- <command>` rather than `npx firebase ...`.

### Link the real Firebase project (Spark plan)

1. In the [Firebase Console](https://console.firebase.google.com), create a project. It starts on Spark. Don't upgrade it or add billing.
2. **Build → Firestore Database → Create database**, and choose **production mode** (deny all), not test mode.
3. **Build → Authentication → Sign-in method**, and enable **Email/Password**.
4. Link it locally: `npm run firebase -- login`, then `npm run firebase -- use --add` and pick the project.

### Secrets: what's safe to commit

- **Safe (not a secret):** the client-side Firebase config (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) from **Project Settings → Your apps**. It only identifies the project and ships inside the app. Access is enforced by `firestore.rules` and Firebase Auth, not by keeping this config hidden.
- **Secret (never commit):** a **service account key** (`serviceAccountKey.json`). It grants full admin access and bypasses all security rules. It's used only by the local seed script, and `Backend/.gitignore` blocks `*serviceAccountKey*.json` and `.env*`.

### Promoting a user to organizer or admin

New users are created as `attendee`. The Spark plan has no Cloud Functions to change roles, so an organizer or admin role is set **manually in the Firebase Console**: go to **Firestore Database → `users/{userId}`**, edit the `role` field to `organizer` or `admin`, and save. Console edits go through the Admin API, so the security rules that stop users from changing their own role don't block them.
