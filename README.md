# Local Events Hub

A mobile app for discovering local events. University group project, theme: **Tech & Startup**.

- `Frontend/` — React Native app (Expo managed workflow, TypeScript)
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
