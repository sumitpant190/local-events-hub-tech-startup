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

## Phase 3 — State & mock data
**Date:** 2026-09-26
**Summary:** Added Zustand stores for auth (isLoggedIn, currentUser) and events (events, selectedEvent, loading and error states), backed by a mock API over local data. The mock data covers 12 Tech & Startup events across six categories, 6 users and 26 comments. The existing screens now read from the stores, and the root navigator switches between Auth and Main based on `isLoggedIn`.
**Files added/changed:**
- Frontend/src/services/types.ts — User, EventItem, EventLocation, EventComment, EventCategory types
- Frontend/src/services/mockData/events.ts — 12 events (hackathons, founder meetups, pitch nights, AI/ML workshops, demo days, panels, mixers)
- Frontend/src/services/mockData/users.ts — 6 mock users
- Frontend/src/services/mockData/comments.ts — 26 comments, 2–3 per event
- Frontend/src/services/mockApi.ts — fetchEvents (600ms simulated latency), getEventComments, user lookups, demo login email
- Frontend/src/store/authStore.ts — login(email), signup(name, email), logout()
- Frontend/src/store/eventsStore.ts — loadEvents(), selectEvent(id), clearSelectedEvent()
- Frontend/src/utils/validation.ts — email check and normalisation
- Frontend/src/utils/date.ts — event date/time formatting
- Frontend/src/navigation/RootNavigator.tsx — shows Auth or Main from authStore.isLoggedIn
- Frontend/src/screens/{Login,Signup,Settings,Profile}Screen.tsx — call auth store actions / show current user
- Frontend/src/screens/EventsListScreen.tsx — FlatList of store events with capped stagger
- Frontend/src/screens/EventDetailsScreen.tsx — selects the event on mount and shows date, venue, attendance and comment count
- Frontend/src/{store,services,utils}/.gitkeep — removed (folders now have files)
**Commit:** `feat(data): add mock events, users and comments with typed models`, `feat(store): add auth and events zustand stores over mock api`, `refactor(nav): drive auth/main switch and screens from stores`, `docs: log phase 3 in git history`
**Notes/decisions:**
- Stores call `services/mockApi.ts` instead of reading the arrays directly, so the backend phase can swap in Axios without touching the stores or screens.
- `login(email)` only accepts emails that exist in mockUsers, and the Login button logs in as the demo user (maya@loopdesk.io). `signup` checks the name and email and keeps the new user in memory only. Real form inputs come in the auth UI phase.
- The auth switch now uses React Navigation's recommended conditional-screens pattern. Logging out plays a "pop" animation instead of a push.
- `loadEvents` ignores repeat calls while a load is running, and on failure it sets a friendly error string.
- Event venues and addresses are made up and have no city, since the target city hasn't been decided yet.
- Dates are ISO-8601 in UTC and are formatted with the device locale.
- The mock data was checked with a one-off Node script: unique IDs, valid user/event references, attendance within capacity, start before end, and at least 2 comments per event. There's still no test runner in the project, so store unit tests will come when one is added.
