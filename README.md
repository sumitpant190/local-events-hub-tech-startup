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
