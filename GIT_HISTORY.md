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

## Phase 4 — Login & Signup
**Date:** 2026-09-26
**Summary:** Built fully styled Login (email, password) and Signup (name, email, password, confirm password) screens. They validate input, show errors that animate in and out, and sign in against mock credentials. On mount the header, glass card, each field, the button and the footer fade up in sequence over two slowly pulsing brand-colored glows. A successful login or signup sets `isLoggedIn` and lands on EventsList.
**Files added/changed:**
- Frontend/src/theme/colors.ts — added withAlpha() for translucent token variants
- Frontend/src/components/FadeInUp.tsx — staggered fade-up wrapper driven by an index
- Frontend/src/components/AnimatedMessage.tsx — error text/banner that animates height, opacity and position in and out
- Frontend/src/components/FormField.tsx — labelled input with animated focus/error border, password show/hide toggle and inline error
- Frontend/src/components/BackgroundGlow.tsx — two looping primary/accent glow orbs
- Frontend/src/components/AuthScreenLayout.tsx — shared auth shell: glow background, keyboard-aware scroll, eyebrow pill, headline, card, footer
- Frontend/src/components/AuthFooterLink.tsx — "prompt + action" switch link with press feedback
- Frontend/src/utils/validation.ts — validateLogin/validateSignup, hasErrors, MIN_PASSWORD_LENGTH (8), MAX_NAME_LENGTH (60)
- Frontend/src/services/mockApi.ts — in-memory mock accounts, authenticate(), registerAccount(), DEMO_PASSWORD
- Frontend/src/store/authStore.ts — login(email, password) and signup(name, email, password) now return { ok } or { ok: false, error }
- Frontend/src/screens/LoginScreen.tsx — validated login form with demo credentials hint
- Frontend/src/screens/SignupScreen.tsx — validated signup form
**Commit:** `feat(ui): add form field, animated message and fade-in-up components`, `feat(auth): check passwords and block duplicate emails in mock auth`, `feat(auth): build validated login and signup screens`, `docs: log phase 4 in git history`
**Notes/decisions:**
- Errors stay hidden until the first submit, then update live as the user types. A form-level banner shows auth failures ("Incorrect email or password.", "An account with this email already exists.").
- All mock users share the demo password `startup123` (for example maya@loopdesk.io / startup123), and the Login screen shows this hint. Mock passwords are plaintext and in memory only. The backend phase replaces this.
- The auth store re-checks name, email and password length even though the forms already validate them, so bad data can't get in through another caller.
- Errors animate to their measured height rather than using moti's `AnimatePresence`. That comes from the nested framer-motion copy, which bundles the duplicate React from Phase 1, and could crash with "invalid hook call".
- The keyboard "next" key moves between fields, "go" submits, and the email fields use email keyboards with autofill hints.
- The validation rules were checked with a one-off Node assert script covering required fields, email format, whitespace handling, the 8-character minimum, password match and name length.

## Phase 5 — Events list
**Date:** 2026-09-26
**Summary:** Rebuilt EventsList as a "Discover" feed of designed event cards pulled from eventsStore. Each card has a category-icon cover, a date tile, an accent category badge, the title, date/time, venue and attendee count. A search bar filters by title and a horizontal row of chips filters by category, and cards stagger in, spring on press, and fade and slide into place when the filters change. Shimmering skeleton cards cover the simulated load, and there are empty-results and load-error states.
**Files added/changed:**
- Frontend/src/components/EventCard.tsx — event card with cover placeholder, date tile, badge and meta rows
- Frontend/src/components/CategoryBadge.tsx — accent-colored category pill
- Frontend/src/components/SkeletonBlock.tsx — shimmer block (looping soft highlight band)
- Frontend/src/components/EventCardSkeleton.tsx — skeleton matching EventCard's layout
- Frontend/src/components/EmptyState.tsx — icon, title, message and optional action, used for no results and load errors
- Frontend/src/components/SearchBar.tsx — search input with animated focus border and clear button
- Frontend/src/components/CategoryChip.tsx — filter chip with animated selected state
- Frontend/src/components/CategoryFilterBar.tsx — horizontal chip row: All plus six categories
- Frontend/src/components/PressableScale.tsx — added pressedScale and accessibilityState props
- Frontend/src/theme/motion.ts — added CARD_PRESSED_SCALE and MAX_STAGGERED_ITEMS
- Frontend/src/services/types.ts — EVENT_CATEGORIES array; EventCategory now derived from it
- Frontend/src/services/mockApi.ts — mock latency raised to 1000ms so the skeleton is visible
- Frontend/src/utils/filterEvents.ts — pure title + category filter
- Frontend/src/utils/categoryIcons.ts — Ionicons icon per category
- Frontend/src/utils/date.ts — getDateParts() for the month/day tile
- Frontend/src/screens/EventsListScreen.tsx — search, chips, skeletons, animated list, empty and error states
**Commit:** `feat(ui): add event card, category badge and shimmer skeleton components`, `feat(events): add search and category filter chips to events list`, `docs: log phase 5 in git history`
**Notes/decisions:**
- The list uses Reanimated's `Animated.FlatList`. Cards enter with a springy FadeInUp and leave with FadeOut, and the remaining cards spring into their new positions (`itemLayoutAnimation`) when search or chips change. Only the first 6 cards stagger, so cards scrolled into view later don't wait.
- The card press uses a subtler 0.975 scale than buttons (0.96).
- The shimmer is a three-step translucent band sliding across each block. This fakes a gradient without adding expo-linear-gradient.
- Search matches titles only, is case-insensitive and ignores surrounding whitespace, and it combines with the category filter. Filter state is local to the screen because nothing else needs it.
- Cover images are placeholders (a category icon on a tinted cover), since the mock events have no image URLs.
- filterEvents was checked with a one-off Node assert script covering no filter, whitespace query, category only, case-insensitive title, query plus category, and title-only matching.

## Phase 6 — Event details & RSVP
**Date:** 2026-09-26
**Summary:** Rebuilt EventDetails as a full event page. It has a parallax hero, a floating back button, and a rounded content sheet with the date/time range, venue and address, attendee count with an animated capacity bar, a "You + N others going" avatar preview, an organizer card, the description and tags. A sticky RSVP button toggles with a spring pop, a surface→primary color transition and a spinning icon. The attendee count updates optimistically in eventsStore and rolls back if the mock request fails.
**Files added/changed:**
- Frontend/src/store/eventsStore.ts — rsvpEventIds, pendingRsvpIds, rsvpError and an optimistic toggleRsvp(eventId) with rollback
- Frontend/src/utils/rsvp.ts — isEventFull() and adjustAttendeeCount() (immutable, clamped to 0..capacity)
- Frontend/src/services/mockApi.ts — updateRsvp() (400ms mock write), getAttendeePreview() (deterministic faces)
- Frontend/src/utils/date.ts — formatEventRange() for same-day and multi-day events
- Frontend/src/components/RsvpButton.tsx — pop animation, color transition, icon spin-in, disabled "Event full" state
- Frontend/src/components/AttendeePreview.tsx — overlapping avatar stack; your avatar zooms in, and the label animates when it changes
- Frontend/src/components/Avatar.tsx — initials avatar with an optional highlighted (current user) style
- Frontend/src/components/EventHero.tsx — category hero with parallax and pull-down stretch driven by scroll
- Frontend/src/components/BackButton.tsx — floating translucent back button
- Frontend/src/components/InfoRow.tsx — icon tile + title/subtitle row
- Frontend/src/components/CapacityBar.tsx — spring-animated fill that switches to accent above 85% full
- Frontend/src/components/OrganizerCard.tsx — "Hosted by" card
- Frontend/src/components/PressableScale.tsx — added disabled prop
- Frontend/src/screens/EventDetailsScreen.tsx — full details layout, sticky RSVP bar, not-found state
**Commit:** `feat(events): add optimistic rsvp toggle to events store`, `feat(ui): add rsvp button, avatar stack and event hero components`, `feat(events): build event details screen with rsvp and attendee preview`, `docs: log phase 6 in git history`
**Notes/decisions:**
- Optimistic flow: flip the state and count right away, call `updateRsvp`, and on failure restore the previous state and show an error banner. Toggles for an event are ignored while its request is in flight, so rapid double taps can't corrupt the count. Joining a full event is blocked, and the button shows "Event full" (evt-08 is at capacity for testing).
- The count is updated in both `events` and `selectedEvent`, so the list and the details screen stay in sync.
- The details screen falls back to the list copy of the event on its first frame, so it never flashes "not found" before `selectEvent` runs.
- The hero is still a placeholder (category icon on brand glows), since events have no images. Scrolling parallaxes it at half speed, and pulling down stretches it up to 2×.
- The attendee faces are deterministic: the event's commenters first, then other mock users, excluding the current user.
- RSVPs live in eventsStore for the session and aren't tied to a user, so they survive logout. Per-user RSVPs will come with the backend.
- The RSVP label switches color instantly while the background animates, because moti's MotiText typing doesn't allow animating `color`.
- The RSVP helpers were checked with a one-off Node assert script covering increment to capacity, clamping at capacity and zero, no input mutation, and rollback restoring the count.

## Phase 7 — Comments UI
**Date:** 2026-09-26
**Summary:** Added a comments section to EventDetails. Each comment shows an avatar, name ("You" for your own), relative timestamp and text, newest first, under a header with an animated count. A growing text input with a character counter and a spring-press send button posts through a new commentsStore. New comments slide and fade in at the top while the rest spring down, and all input is sanitized on the client first.
**Files added/changed:**
- Frontend/src/utils/sanitize.ts — sanitizeComment(): normalizes line endings, strips `<script>` blocks and other HTML tags, removes control characters, collapses blank lines, trims, caps at 280 characters
- Frontend/src/store/commentsStore.ts — commentsByEvent (newest first), postingEventId, loadComments(), addComment() returning { ok } or { ok: false, error }
- Frontend/src/services/mockApi.ts — postComment() mock write (350ms)
- Frontend/src/utils/date.ts — formatRelativeTime() ("just now", "5m ago", "3h ago", "2d ago", then "Sep 20")
- Frontend/src/components/CommentItem.tsx — avatar, name, timestamp and text row
- Frontend/src/components/CommentInput.tsx — multiline input with focus animation, character counter, animated error, send button with a spinner while posting
- Frontend/src/components/CommentsSection.tsx — header with animated count, input, and animated newest-first list
- Frontend/src/screens/EventDetailsScreen.tsx — comments section added; KeyboardAvoidingView and keyboardShouldPersistTaps for typing
**Commit:** `feat(comments): add comments store with sanitized mock posting`, `feat(comments): add animated comments section to event details`, `docs: log phase 7 in git history`
**Notes/decisions:**
- Sanitization is a client-side placeholder. React Native's `<Text>` doesn't render HTML, so this isn't what prevents XSS. The backend must still validate and escape comments server-side. Plain `<` and `>` in normal text (for example "2 < 3") are kept.
- The store sanitizes again inside addComment, so any caller goes through the same rules. Empty-after-sanitizing comments are rejected with "Comment can't be empty.", and a second post while one is in flight is refused.
- The TextInput's `maxLength` (280) matches the sanitizer's cap. The counter turns red with 20 characters left.
- Comments are stored newest first, so a new post appears next to the input. Reanimated `FadeInDown` handles the slide and fade, and `LinearTransition` springs the existing comments down. The initial list staggers in, capped at 6 items.
- Posting isn't optimistic. The send button shows a spinner for the 350ms mock write, then the comment animates in. This avoids temporary IDs and reconciliation for a single-author action.
- Comments live in memory for the session. The mock API doesn't keep them after a reload.
- The sanitizer and relative-time formatter were checked with a one-off Node assert script covering trim, script and tag stripping (case, attributes, multiline), control characters, blank-line collapsing, keeping plain `<` and `>`, the length cap with trailing trim, and each time bucket.

## Phase 8 — Profile & Settings
**Date:** 2026-09-26
**Summary:** Added a real ThemeContext so a Settings switch flips the whole app between the Phase 1 dark and light palettes, with a soft crossfade. Profile now shows a springy avatar, name, email and headline, the user's RSVP'd events as animated rows, and an "Edit profile" bottom sheet with validation. Settings has spring-physics switches for dark mode and three UI-only notification preferences, an account summary, and a Log out button that clears authStore and animates back to Login.
**Files added/changed:**
- Frontend/src/theme/themeContext.ts — ThemeContext, ColorScheme type, useThemeScheme()
- Frontend/src/theme/ThemeProvider.tsx — holds the scheme (starts from the device setting), setScheme/toggleScheme, crossfades from the old background on change
- Frontend/src/theme/colors.ts — useThemeColors() now reads ThemeContext instead of the device scheme
- Frontend/src/navigation/RootNavigator.tsx — navigation theme follows ThemeContext
- Frontend/src/components/AppShell.tsx — fonts, splash and navigator moved out of App.tsx so they sit inside the provider; status bar follows the scheme
- Frontend/App.tsx — now just ThemeProvider → AppShell
- Frontend/src/components/SpringSwitch.tsx — custom switch: spring thumb that stretches while pressed, animated track color, switch accessibility role
- Frontend/src/components/BottomSheetModal.tsx — Modal with backdrop fade and spring slide up/down; stays mounted until the close animation ends
- Frontend/src/components/EditProfileForm.tsx — name and headline fields with validation; email read-only
- Frontend/src/components/EventListItem.tsx — compact tappable event row
- Frontend/src/components/SettingsGroup.tsx — titled settings card
- Frontend/src/components/InfoRow.tsx — optional `right` slot for trailing controls
- Frontend/src/components/AppButton.tsx — added `danger` variant
- Frontend/src/store/authStore.ts — updateProfile({ name, headline })
- Frontend/src/services/mockApi.ts — updateAccountProfile() so comment authors and organizer lookups show the new name
- Frontend/src/utils/validation.ts — validateProfile(), MAX_HEADLINE_LENGTH (80)
- Frontend/src/screens/ProfileScreen.tsx — profile header, My RSVPs list with empty state, edit sheet
- Frontend/src/screens/SettingsScreen.tsx — Appearance, Notifications and Account groups, Log out
**Commit:** `feat(theme): add ThemeContext with animated dark/light switching`, `feat(ui): add spring switch, bottom sheet and settings components`, `feat(profile): add rsvp list and edit-profile sheet to profile`, `feat(settings): add theme, notification and logout settings`, `docs: log phase 8 in git history`
**Notes/decisions:**
- The context object lives in `themeContext.ts` with no palette imports, so `colors.ts` can read it without a circular dependency. Because `useThemeColors()` kept its signature, all existing components follow the toggle without edits.
- The theme choice is kept in memory: it starts from the device setting on each launch. Persisting it needs AsyncStorage, which isn't installed yet.
- A theme change swaps colors instantly underneath a full-screen overlay in the previous background color, which fades out over 320ms. Components that already animate colors with moti also transition on their own.
- Log out only clears authStore. RootNavigator's conditional screens swap Main for Auth using the "pop" direction of the shared fade-and-slide transition. RSVPs and comments stay for the session, as noted in Phases 6 and 7.
- RSVP rows open EventDetails inside the Events tab with `initial: false`, so back returns to the events list, not Profile.
- The notification switches are UI only (local state). They reset when the Settings screen unmounts, for example after logout.
- Profile validation was checked with a one-off Node assert script covering valid input, an allowed empty headline, blank and too-long names, and headline length measured after trimming.
