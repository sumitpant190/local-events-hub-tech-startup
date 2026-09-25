# Git History

## Phase 1 — Scaffolding
**Date:** 2026-09-26
**Summary:** Scaffolded the Expo (TypeScript) app in `Frontend/` with React Navigation, Zustand, Axios, Reanimated and moti installed. Added theme tokens (colors, typography, spacing) as the single source of truth. On launch, a branded splash fades in while Space Grotesk and Inter load, then the app fades into a one-screen placeholder navigator.
**Files added/changed:**
- .gitignore — root ignores (OS/editor files, local tooling)
- README.md — project title, theme, Setup Guide, structure
- GIT_HISTORY.md — this log
- Frontend/package.json — renamed to local-events-hub-techstartup, Phase 1 deps, node-based scripts, react/react-dom overrides
- Frontend/app.json — app name/slug, automatic light/dark, splash and adaptive icon background #0B0E14
- Frontend/AGENTS.md — switched guidance from Expo Router to React Navigation, added theme and Windows path notes
- Frontend/src/theme/colors.ts — dark/light palettes plus useThemeColors() hook
- Frontend/src/theme/typography.ts — font assets, font family names, text styles
- Frontend/src/theme/spacing.ts — spacing and radius scales
- Frontend/src/components/SplashLoader.tsx — animated branded loading screen
- Frontend/src/navigation/RootNavigator.tsx — themed NavigationContainer with a native stack
- Frontend/src/screens/HomeScreen.tsx — placeholder home screen with spring entrance
- Frontend/App.tsx — font loading, splash handoff, root navigator
- Frontend/src/{store,services,assets,utils}/.gitkeep — empty feature folders
**Commit:** `chore: scaffold expo typescript app with nav, motion and state deps`, `feat(theme): add color, typography and spacing tokens`, `feat(app): load fonts behind animated splash and add root navigator`, `docs: add readme and phase 1 git history`
**Notes/decisions:**
- Expo SDK 57, React Native 0.86, Reanimated 4 (+ react-native-worklets), moti 0.30. Packages installed with `expo install` for SDK-matched versions. Also added expo-font and expo-splash-screen for the splash/font flow.
- Light palette: the spec only fixes background/text inversion, so light surface (#FFFFFF), surfaceElevated (#ECEEF4), border (#DCDFE8) and textSecondary (#5E6275) are derived values. Change them in `colors.ts` if the team wants different tones.
- The splash uses the system font because it appears before the custom fonts are loaded. It stays up for at least 1.2s, and a font load error falls back to system fonts instead of hanging.
- The repo path contains `&`, which breaks npm `.bin` shims on Windows, so the npm scripts call `node node_modules/expo/bin/cli` directly.
- Known issue: expo-doctor reports a duplicate `react@19.3.0` nested under moti's web-only framer-motion dependency. The Android bundle builds fine. A clean reinstall (delete node_modules and package-lock.json) should apply the react/react-dom overrides and clear it.
- The template's MIT LICENSE (Expo/650 Industries) is still in `Frontend/`. Replace or remove it once the group picks a license.
- Git identity set in the repo's local config: sumitpant190 <sumitpant190@gmail.com>.

## Phase 2 — Navigation skeleton with motion
**Date:** 2026-09-26
**Summary:** Built the full navigation tree. A root stack switches between an Auth stack (Login/Signup) and a bottom-tab app (Events, Profile, Settings), and EventDetails is pushed on top of EventsList inside the Events tab. Every stack shares one tuned fade+slide transition (350ms), tab switches animate, and all six placeholder screens use the theme colors and have spring-press buttons that navigate between them.
**Files added/changed:**
- Frontend/package.json, package-lock.json — added @react-navigation/bottom-tabs and @expo/vector-icons
- Frontend/src/theme/motion.ts — shared durations, spring presets, stagger and press-scale values
- Frontend/src/theme/colors.ts — added onPrimary token for text on primary fills
- Frontend/src/components/PressableScale.tsx — spring scale-down press wrapper
- Frontend/src/components/AppButton.tsx — primary/ghost button built on PressableScale
- Frontend/src/components/ScreenContainer.tsx — themed safe-area screen shell with spring entrance
- Frontend/src/components/TabBarIcon.tsx — Ionicons tab icon that springs up when focused
- Frontend/src/navigation/types.ts — typed param lists for root, auth, tabs and events stacks
- Frontend/src/navigation/stackOptions.ts — shared native-stack transition (fade_from_bottom, 350ms)
- Frontend/src/navigation/AuthStack.tsx — Login and Signup
- Frontend/src/navigation/MainTabs.tsx — themed bottom tabs with shift animation
- Frontend/src/navigation/EventsStack.tsx — EventsList with EventDetails pushed on top
- Frontend/src/navigation/RootNavigator.tsx — root stack switching Auth and Main
- Frontend/src/screens/{Login,Signup,EventsList,EventDetails,Profile,Settings}Screen.tsx — placeholder screens
- Frontend/src/screens/HomeScreen.tsx — removed (replaced by EventsList)
**Commit:** `chore(deps): add bottom-tabs and vector-icons`, `feat(ui): add motion tokens and spring press components`, `feat(nav): add auth stack, bottom tabs and events stack with tuned transitions`, `docs: log phase 2 in git history`
**Notes/decisions:**
- There's no auth state yet. Log in / Sign up reset the root stack to Main, and Log out resets it to Auth. A Zustand auth store will replace this in the auth phase.
- `animationDuration: 350` only takes effect on iOS. On Android, `fade_from_bottom` runs at its native timing, which is close to 350ms.
- EventDetails keeps the tab bar visible because it's pushed inside the Events tab's stack, not above the tabs.
- EventsList uses three inline placeholder events with a staggered spring entrance. They'll be replaced by mock data and cards in a later phase.
- Headers are hidden everywhere. Screens show their own titles through ScreenContainer, and EventDetails has a "Back to events" button (the swipe/hardware back also works).
