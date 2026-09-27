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

## Phase 9 — API layer scaffolding
**Date:** 2026-09-26
**Summary:** Added the API layer. An Axios instance takes its base URL from `EXPO_PUBLIC_API_URL`, attaches the JWT and handles 401s. Per-resource services return the exact shapes the real backend will return, and a `USE_MOCK_DATA` flag switches them between an in-memory mock backend and the real API. Stores and screens now go only through the services, so switching needs no component changes. RSVPs are now per account: they reload on login and clear on logout.
**Files added/changed:**
- Frontend/src/services/config.ts — USE_MOCK_DATA (from EXPO_PUBLIC_USE_MOCK_DATA, default true), API_URL (from EXPO_PUBLIC_API_URL), request timeout; fails fast if real mode has no URL
- Frontend/src/services/api.ts — Axios instance, Bearer-token request interceptor, 401 response interceptor (sign-out handler, skipped for login/signup), ApiError, envelope-unwrapping request()
- Frontend/src/services/types.ts — API contract types: ApiEnvelope, AuthSession, PublicUser, RsvpStatus, CommentWithAuthor
- Frontend/src/services/authService.ts — login, signup, demoCredentials (mock mode only)
- Frontend/src/services/usersService.ts — updateMe, getUser
- Frontend/src/services/eventsService.ts — listEvents
- Frontend/src/services/rsvpService.ts — listMyRsvpEventIds, setRsvp, listAttendees
- Frontend/src/services/commentsService.ts — listComments, createComment
- Frontend/src/services/mockApi.ts — rewritten as an in-memory mock backend: one function per endpoint, fake per-user tokens, per-account RSVPs, server-side sanitizing and capacity checks
- Frontend/src/store/authStore.ts — async login/signup/updateProfile via services; sets/clears the token; registers the 401 sign-out handler; resets and reloads RSVP state per session
- Frontend/src/store/eventsStore.ts — loads via services; new loadMyRsvps and resetUserState; toggleRsvp adopts the server's count and ignores responses after sign-out
- Frontend/src/store/commentsStore.ts — loads/posts via services; comments carry their author; per-event load errors
- Frontend/src/utils/useEventPeople.ts — organizer and attendee faces for EventDetails via services
- Frontend/src/screens/{LoginScreen,SignupScreen}.tsx, Frontend/src/components/EditProfileForm.tsx — await async store actions, ignore double taps; Login demo hint only in mock mode
- Frontend/src/screens/EventDetailsScreen.tsx, Frontend/src/components/CommentsSection.tsx — no more direct mockApi imports; comment load error shown
- Frontend/src/components/{AttendeePreview,OrganizerCard}.tsx — accept PublicUser
- Frontend/.env.example, Frontend/.gitignore — documented env vars; .env and .env.* now ignored
- README.md — how to switch to the real API and the full endpoint contract
**Commit:** `feat(api): add axios client with jwt and 401 interceptors`, `feat(api): add per-resource services backed by a mock backend`, `refactor(store): route stores and screens through api services`, `docs: log phase 9 and document api contract`, `docs: add phase 9 entry to git history`
**Notes/decisions:**
- Every response uses the `{ success, data, error }` envelope. `request()` unwraps it and throws ApiError, whose message is safe to show users. Network, timeout and 401 errors get friendly defaults.
- A 401 from any authenticated call clears the token and signs the user out through a handler that authStore registers, so api.ts never imports a store. 401s from /auth/login and /auth/signup are treated as "wrong credentials" and don't trigger sign-out.
- The JWT is kept in memory only, so a restart means logging in again. Persisting it (e.g. expo-secure-store) is left for the backend/auth phase.
- Comments come back with their author embedded (`CommentWithAuthor`), and the server takes the author from the token. The client no longer looks users up or sends an author id.
- Closes the security audit lead `eventsStore.rsvpEventIds/cross-account-state-retention`: RSVPs are keyed per account in the (mock) backend, and the store resets on login/logout and reloads via `GET /me/rsvps`. In-flight RSVP responses that arrive after sign-out are dropped.
- The mock backend re-validates like a server would: capacity (409), duplicate email (409), comment sanitising (422), session required (401).
- Commit `ccf3ce5 fix(app): render navigator in a plain view so cold start isn't stuck at opacity 0` landed just before this phase. It fixes the blank screen on cold start in Expo Go and silences moti's SafeAreaView deprecation warning.
- Verified with typecheck and an Android bundle export. A device run-through of this phase was not possible because the emulator had been closed.

## Phase 10 — Polish & bonus
**Date:** 2026-09-26
**Summary:** Audited every screen and component against the theme and moved all remaining styling drift onto tokens: 13 ad-hoc tint strengths, 8 hard-coded durations and scattered letter-spacing and font-size overrides. Light mode was redesigned as its own palette rather than a swap, with semantic color roles tuned per scheme and verified with WCAG contrast checks. Bonuses: the events list is cached in AsyncStorage for offline use, and EventDetails shows a themed react-native-maps card for each venue.
**Files added/changed:**
- Frontend/src/theme/colors.ts — semantic roles per scheme: accentText, errorText, primaryTint, accentTint, errorTint, primarySurface, primaryBorder, accentBorder, errorBorder, glowPrimary, glowAccent, surfaceGlass, scrim
- Frontend/src/theme/typography.ts — overline, eyebrow and tabLabel text styles; systemTypography for the pre-font splash
- Frontend/src/theme/motion.ts — named durations (fast, colorShift, textSwap, fadeIn, splash, pulse) and ready-made `timings`
- Frontend/src/components/{AnimatedMessage,AppButton,AttendeePreview,AuthScreenLayout,Avatar,BackButton,BackgroundGlow,BottomSheetModal,CategoryBadge,CategoryChip,CommentInput,CommentsSection,EmptyState,EventCard,EventHero,EventListItem,FadeInUp,FormField,InfoRow,OrganizerCard,SearchBar,SettingsGroup,SplashLoader,SpringSwitch}.tsx — ad-hoc withAlpha tints, inline durations and type overrides replaced with tokens
- Frontend/src/navigation/MainTabs.tsx, Frontend/src/screens/{EventDetailsScreen,ProfileScreen,EventsListScreen}.tsx — same token migration
- Frontend/src/services/eventsCache.ts — AsyncStorage read/write of `{ savedAt, events }` with a shape check on read
- Frontend/src/store/eventsStore.ts — shows the cache instantly, refreshes from the API, caches each success, and falls back to offline mode (isOffline, cachedAt) when a refresh fails
- Frontend/src/components/OfflineBanner.tsx — animated "You're offline · showing events saved 2h ago" banner with Retry
- Frontend/src/screens/EventsListScreen.tsx — offline banner and themed pull-to-refresh
- Frontend/src/components/EventMap.tsx — static map card with a palette-derived map style that opens the device's maps app on tap
- Frontend/src/services/types.ts — optional `EventLocation.coordinates`
- Frontend/src/services/mockData/venueCoordinates.ts, Frontend/src/services/mockApi.ts — placeholder coordinates attached per venue
- Frontend/src/screens/EventDetailsScreen.tsx — map card under the venue row
- Frontend/package.json, package-lock.json — @react-native-async-storage/async-storage 2.2.0, react-native-maps 1.27.2 (Expo also re-pinned react-native-worklets to 0.10.1 for SDK 57)
- README.md — coordinates field, maps API key note, offline behaviour
**Commit:** `refactor(theme): add semantic color roles and a tuned light palette`, `refactor(ui): replace inline tints, durations and type overrides with theme tokens`, `chore(deps): add async-storage and react-native-maps`, `feat(events): cache events list in asyncstorage for offline mode`, `feat(events): add venue map to event details with placeholder coordinates`, `docs: log phase 10 and document offline mode and maps`
**Notes/decisions:**
- **Light mode is designed, not inverted.** The spec's background/text swap and identical primary/accent fills are kept, but the supporting roles differ per scheme:
  - lighter tints and glows on white, since strong ones look muddy;
  - stronger borders on tinted fills;
  - a dark scrim behind sheets instead of a light wash;
  - darker text-only variants of accent (#0E7490) and error (#C53030).
- **Contrast check (WCAG):** light-mode accent badge text went from 1.67:1 to 4.88:1 and error text from 2.78:1 to 5.47:1. Every text role now passes AA in both schemes, with dark-mode values unchanged in spirit.
- **Remaining drift, on purpose:** the only `withAlpha` left in components is SkeletonBlock's shimmer gradient steps, from a named `BAND_ALPHAS` constant. SplashLoader uses `systemTypography` because it renders before custom fonts load.
- **Offline cache scope:** only the public events list is cached, under the key `leh:events:v1`. No token, profile or RSVP data is stored on the device, so the cache is safe across accounts. Cached data is shape-checked before use, and read/write failures fall back to the network silently because the cache is best-effort. Offline mode only shows when a refresh fails and cached events are on screen; with nothing cached, the existing "Couldn't load events" state applies.
- **Map:** coordinates are placeholders around Market St, San Francisco, matching the made-up "12 Market Street" address. It's a lite-mode, non-interactive preview, so it's cheap inside a ScrollView, and tapping it opens `geo:` (Android) or `maps:` (iOS). A custom Google map style built from the palette themes it on Android, and iOS uses `userInterfaceStyle`. Release Android builds need a Google Maps API key in app.json; Expo Go does not.
- **Not verified on a device:** the emulator was closed, so the light/dark look, map rendering and offline banner were checked by typecheck, Android bundle export and the contrast calculations only.

---

# Backend (Firebase, Spark plan)

## Phase 1 — Setup
**Date:** 2026-09-26
**Summary:** Scaffolded the Firebase backend in `Backend/` for the free Spark plan: Firestore plus the Auth and Firestore emulators, with no Cloud Functions. Firestore starts in production mode with a single deny-all rule, and secret files are git-ignored before any backend file was committed. The README now has a Backend Setup Guide.
**Files added/changed:**
- Backend/.gitignore — node_modules, `.env*`, `*serviceAccountKey*.json`, `service-account*.json`, `.firebase/`, and the firebase/firestore/ui debug logs and emulator data
- Backend/package.json, Backend/package-lock.json — firebase-tools 15.31.0 as a local dev dependency, with `emulators` and `firebase` scripts that call the CLI through node
- Backend/firebase.json — Firestore rules/indexes plus emulators: auth 9099, firestore 8080, UI 4000, single-project mode
- Backend/.firebaserc — default project `demo-local-events-hub`
- Backend/firestore.rules — production mode: deny all reads and writes
- Backend/firestore.indexes.json — empty
- README.md — Backend Setup Guide (running the emulators, linking the real Spark project, what's secret and what isn't, manual role promotion in the Console)
**Commit:** `chore(backend): scaffold firebase spark project with deny-all rules and emulators`
**Verified:**
- `npm run emulators` (firebase emulators:start) printed "All emulators ready!" with Auth on 127.0.0.1:9099, Firestore on 127.0.0.1:8080 and the UI on 127.0.0.1:4000. There were no errors.
- An unauthenticated REST `GET .../documents/events/x` against the Firestore emulator returned `403 PERMISSION_DENIED` ("false for 'get' @ L8"), so deny-all is enforced.
- `git status --ignored` shows the debug logs and node_modules ignored; no credential files are present or staged.
- No rules tests were written in this phase.
**Notes/decisions:**
- **No new git repo:** the repository already existed at the root from the frontend work, so no `git init` was run. The backend lives in `Backend/` and is logged here, at the root as requested earlier. Running `git init` inside `Backend/` would have created a nested repository.
- **`firebase init` written by hand:** it's interactive and needs `firebase login`, so its output (firebase.json, .firebaserc, rules, indexes) was written directly, selecting only Firestore and the Auth + Firestore emulators.
- **Demo project ID:** `demo-local-events-hub` makes the emulators run with no login, no real project and no possibility of reaching production. The real Spark project (Firestore in production mode, Email/Password Auth) is created in the Console and linked with `firebase use --add`, as documented in the README. It could not be created from here because that requires your Google account.
- **Secrets:** the client web config (apiKey, authDomain, projectId, …) is not a secret; it identifies the project and ships in the app. The service account key (Phase 2 seed script only) is the secret, and it's git-ignored.
- **Blaze check:** nothing added needs Blaze. Firestore, Auth, Security Rules and the local emulators are all Spark-compatible.
- **Data-model gap still open:** the model in the backend spec differs from the frontend's current types (date vs startsAt/endsAt, location shape, capacity/tags, headline vs role/avatarUrl, comment `text`/`userId` vs `body`/`authorId`). I'm assuming the backend spec is the source of truth until you say otherwise.

## Phase 2 — Data modeling & seed data
**Date:** 2026-09-26
**Summary:** Added TypeScript interfaces for the four Firestore document types, exactly per the schema, plus an emulator-only firebase-admin seed script. The script creates 4 users (Auth accounts and `users` docs), 12 Tech & Startup events reused from the frontend mock data, 28 RSVPs and 24 comments. `npm run seed:emulator` refuses any target that isn't the local emulators.
**Files added/changed:**
- Backend/src/types.ts — `User`, `Event`, `Rsvp` and `Comment` interfaces, the role/category/status unions, and a structural `FirestoreTimestamp` that both the Admin and client SDKs satisfy
- Backend/scripts/emulatorGuard.ts — `resolveEmulatorTarget()`: requires a `demo-` project, local emulator hosts and no `GOOGLE_APPLICATION_CREDENTIALS`
- Backend/scripts/seedData.ts — the frontend's events and comments mapped onto the backend schema, with explicit RSVPs per event
- Backend/scripts/seed.ts — wipes the emulators through emulator-only REST endpoints, creates Auth users, and writes every doc in one batch, with counters derived from the seeded subcollections
- Backend/tests/emulatorGuard.test.ts — 5 `node:test` cases for the guard (defaults, loopback hosts, non-demo project, credentials set, remote/lookalike hosts)
- Backend/tsconfig.json — strict, noEmit, erasable-syntax-only settings so Node runs the `.ts` files directly
- Backend/package.json, package-lock.json — `"type": "module"`, engines `node >=22.18`, scripts `seed:emulator`, `test` and `typecheck`; firebase-admin 14.5.0, typescript 7.0.2 and @types/node as dev dependencies
- README.md — Node 22.18+ prerequisite, a "Seed the emulators" section, and a backend scripts table
**Commit:** `feat(seed): add firestore types and emulator-only seed script`
**Verified:**
- `npm run typecheck`: clean.
- `npm test`: 5/5 pass.
- **Refusals:** `GCLOUD_PROJECT=local-events-hub npm run seed:emulator` aborted ("not a demo- project"), and `FIRESTORE_EMULATOR_HOST=firestore.googleapis.com:443` aborted ("not a local emulator"). With the emulators stopped, it aborted with "Can't reach the emulator… npm run emulators". All three exited with code 1.
- **Seeding:** `npm run emulators` reported "All emulators ready!", then `npm run seed:emulator` seeded 4 users, 12 events, 28 RSVPs and 24 comments. A second run also succeeded, which proves the wipe and re-seed is repeatable.
- **Read-back from the emulator REST API:**
  - Field sets are exactly `users {avatarUrl, email, name, role}`, `events {attendeeCount, category, commentCount, date, description, imageUrl, location, organizerId, title}`, `rsvps {status, updatedAt}` and `comments {createdAt, text, userId}`.
  - Every event's `attendeeCount` equals its "going" RSVPs and `commentCount` equals its comments.
  - The Auth emulator holds 4 accounts.
**Notes/decisions:**
- **Schema over frontend shape:** where the schema and the frontend mock differ, the schema wins, and no extra fields were added.
  - `date` is the frontend's `startsAt` as a Timestamp.
  - `location` is one string, "Venue, Address".
  - `endsAt`, `capacity`, `tags`, `headline` and `interests` aren't stored.
  - Event ids, titles, descriptions, categories and comment ids/text match the frontend.
- **4 users, not 6:** the spec asked for 3–4. Kept Maya (usr-01) and Daniel (usr-04) as organizers, and Priya (usr-05) and Liam (usr-06) as attendees. Events and comments by the frontend's other users (Arjun, Sofia) were reassigned to these four, and the organizer-voiced replies went to the event's organizer.
- **Counters are real:** `attendeeCount`/`commentCount` are derived from the seeded docs (0–3 going per event), not the frontend's display numbers (e.g. 142). The Phase 3+ rules will enforce ±1 updates, which only works from a consistent starting point.
- **No service account key needed:** against the emulator, firebase-admin authenticates with nothing, so the seed deliberately refuses when `GOOGLE_APPLICATION_CREDENTIALS` is set. A key would only be needed to write to a real project, which this script never does.
- **Demo password:** `startup123` is committed on purpose. It's the same emulator-only demo password the frontend mock already uses, and it's not a real credential.
- **No build step:** Node ≥22.18 strips TypeScript types natively, so there's no ts-node/tsx dependency. `tsc` is used only for type checking.
- **Placeholder images:** `imageUrl` uses picsum.photos and `avatarUrl` uses DiceBear initials.
- **Blaze check:** the seed runs locally against the emulators. Nothing is deployed, and nothing needs Blaze.
- **npm audit:** 5 moderate advisories in transitive dependencies of the dev tooling (`@opentelemetry/core`, `uuid`, via firebase-admin/firebase-tools). They're dev-only, not shipped, and `audit fix --force` would downgrade major versions, so they're left as is.
- **Windows gotcha:** stopping the backgrounded `npm run emulators` doesn't kill its Java/Node children, so leftover emulators kept ports 8080/9099 busy. They had to be stopped by PID. Stop emulators with Ctrl+C in their own terminal.

## Phase 3 — Auth
**Date:** 2026-09-26
**Summary:** Documented the client-side signup contract (Auth SDK signup, then the app creates `users/{uid}` with `role: "attendee"` hardcoded), because the Spark plan has no Auth triggers. Added a reference `signUp()` and the first Firestore rule, which lets a signed-in user create only their own attendee profile and read only their own profile. Added emulator tests that sign up against the Auth emulator, write the profile the way the app will, and prove tampered clients are rejected.
**Files added/changed:**
- Backend/firestore.rules — `users/{userId}`: own-profile `get`; `create` only for your own uid, with exactly {name, email, role, avatarUrl}, `role == 'attendee'`, email equal to the auth token's email, name 1–80 non-blank characters, and avatarUrl a string of at most 2048 characters. Everything else stays deny-all.
- Backend/src/signUp.ts — reference signup: `createUserWithEmailAndPassword`, then `setDoc(users/{uid})` with the hardcoded attendee role; rolls back the Auth user if the profile write fails
- Backend/tests/signup.emulator.test.ts — 7 emulator tests covering the happy path, role escalation to organizer/admin, extra fields, missing fields, a spoofed email, blank or long names, another user's uid (create and read), overwriting an existing profile, signed-out writes, and the rollback on failure
- Backend/scripts/runEmulatorTests.ts — runs test files inside `emulators:exec`, then on Windows shuts the Firestore emulator down through its `/shutdown` endpoint
- Backend/package.json, package-lock.json — `firebase` 12.19.0 (client SDK, dev); a `test:emulator` script; `emulators` pinned to `--project demo-local-events-hub`
- Backend/.firebaserc, Backend/firebase.json — your own `firebase use`/`init` changes (default project `events-hub-techstartup`, Firestore location `nam5`), committed as-is
- README.md — "Signup contract (client-side)", an expanded role-promotion section (Console and Emulator UI), the `test:emulator` script, the emulator project pinning, and a corrected service-account note (nothing in the repo needs a key)
**Commit:** `feat(auth): add client-side signup contract with attendee-only profile rule`
**Verified:**
- `npm run typecheck`: clean.
- `npm test`: 5/5 pass.
- `npm run test:emulator`: 7/7 pass, run twice back to back with both exiting 0. No emulator process was left listening on 4000/8080/9099 afterwards.
- `npm run emulators` reported "All emulators ready!" on the demo project with no errors, and `npm run seed:emulator` still seeds 4 users, 12 events, 28 RSVPs and 24 comments.
**Notes/decisions:**
- **Why a rule in the Auth phase:** the Phase 1 deny-all rule would reject the app's own profile write, so the step 3 test couldn't pass. Also, "role hardcoded to attendee" only protects anything if the server enforces it, since anyone can call Firestore with the public config. Only the signup-related grants were added: own-profile create and own-profile read. Profile updates, reading other users' public profiles and admin access are left for the rules phase.
- **Create-only:** Firestore treats a write to an existing doc as `update`, which is still denied, so signing up again can never reset a promoted role or overwrite a profile.
- **Emulators pinned to the demo project:** `.firebaserc` now defaults to the real project `events-hub-techstartup`, so `npm run emulators` and `test:emulator` pass `--project demo-local-events-hub`. Local runs stay isolated from production and match the seed script's project. `npm run firebase -- deploy --only firestore:rules` still targets the real project. The rules have not been deployed.
- **Windows bug found and fixed:** `firebase emulators:exec` exits without stopping the Firestore emulator's Java process on Windows, so the next run fails with "port taken". The test runner now POSTs to the emulator's `/shutdown` endpoint when the tests finish.
- **Email normalisation:** the profile uses `credential.user.email`, which Firebase lowercases, so it always matches `request.auth.token.email`. The test signs up with an uppercase email to check this.
- **Blaze check:** everything is client SDK plus Security Rules. There's no Auth trigger or Cloud Function, and nothing needs Blaze.

## Phase 4 — Security rules
**Date:** 2026-09-26
**Summary:** Replaced the signup-only rules with the full deny-by-default rule set for users, events, RSVPs and comments. Roles are read live from the caller's own user doc through `get()` (`callerRole()` and `isAdmin()`), because the Spark plan has no custom claims. Added 55 `@firebase/rules-unit-testing` tests (positive and negative) that run against the Firestore emulator, led by the role-spoofing cases.
**Files added/changed:**
- Backend/firestore.rules — full rules:
  - **Helpers:** `isSignedIn`, `isSelf`, `callerRole` (`get()` of `users/$(request.auth.uid)`), `isAdmin`, `isOrganizerOrAdmin`, `hasExactly`, `isNonBlankString`, `eventExists`.
  - **users:** read when signed in; create as your own uid, attendee only, with your own email; update your own `name`/`avatarUrl` with role unchanged, or any field as an admin; email immutable; no delete.
  - **events:** read when signed in; create as organizer or admin under your own `organizerId`, with counters at 0 and a validated shape; update/delete by the owner or an admin; `organizerId` and the counters frozen on edit.
  - **rsvps:** read when signed in; create/update only your own uid's doc, with status going/not_going, a server `updatedAt`, and an existing event; no delete.
  - **comments:** read when signed in; create as yourself with non-blank text under 500 characters, a server `createdAt` and an existing event; no update; delete by the author or an admin.
  - Catch-all deny.
- Backend/tests/rules.emulator.test.ts — 55 rules tests; fixtures are reset before every test
- Backend/tests/signup.emulator.test.ts — dropped the "can't read other profiles" assertion, since profiles are now readable by signed-in users per the spec
- Backend/scripts/runEmulatorTests.ts — runs test files one at a time (they share one emulator)
- Backend/package.json, package-lock.json — `@firebase/rules-unit-testing` 5.0.2 (dev); `test:emulator` runs both emulator test files
- README.md — "Access rules" table and the frontend requirements (serverTimestamp, cancel an RSVP with not_going, exact fields)
**Commit:** `feat(rules): add role-based firestore rules with self-promotion guards and rules tests`
**Verified:**
- `npm run typecheck`: clean.
- `npm test`: 5/5 pass.
- `npm run test:emulator`: **62/62 pass** (55 rules tests plus 7 signup tests) and exited 0, with no emulator left running afterwards.
- **Mutation check:** I temporarily deleted the "role unchanged / only name+avatarUrl" lines from the self-update rule. 5 tests then failed: the 4 update-based role-spoofing tests and the Phase 3 "re-signup can't overwrite a role" test. The rules were restored byte-identical (`cmp`) and the suite passes again, so these tests do catch the regression they exist for.
- `npm run emulators`: "All emulators ready!" with no errors; `npm run seed:emulator` still seeds 4 users, 12 events, 28 RSVPs and 24 comments.
**Negative cases tested:**
- **Role spoofing:**
  - sign up as organizer; sign up as admin;
  - `updateDoc({role: 'organizer'})` on your own doc; full `setDoc` overwrite of your own doc with `role: 'admin'`;
  - a role change hidden alongside a legitimate name change;
  - an organizer promoting themselves to admin; an organizer promoting someone else.
- **Users:**
  - create a doc for another uid; sign up with an email that isn't your login email;
  - edit someone else's profile; add an extra field (`isAdmin: true`); change your own email;
  - delete a profile; read profiles when signed out.
- **Events:**
  - read when signed out; an attendee creating an event; a demoted organizer creating an event;
  - creating under another `organizerId`; creating with an inflated `attendeeCount`; creating with an unknown category or an extra field;
  - editing or deleting another organizer's event; handing your event's `organizerId` to someone else;
  - editing your own event's `attendeeCount`/`commentCount`; an attendee editing or deleting an event.
- **RSVPs:**
  - RSVP as someone else; change someone else's RSVP;
  - an invalid status (`maybe`) or an extra field; a backdated `updatedAt`;
  - RSVP to a nonexistent event; delete an RSVP; RSVP when signed out.
- **Comments:**
  - post as someone else;
  - empty, whitespace-only, exactly 500-character or non-string text;
  - a backdated `createdAt` or an extra field;
  - edit someone else's comment; edit your own comment;
  - delete someone else's comment (as an attendee, and as the event's organizer);
  - comment on a nonexistent event; comment when signed out.
- **Other:** unknown collections are denied even for an admin.
**Notes/decisions:**
- **Tighter than the spec, on purpose (every change is a restriction, never a loosening):**
  - Self-update may change only `name`/`avatarUrl`, not just "role unchanged". That blocks smuggled fields and email changes.
  - Email is immutable for everyone.
  - Admin updates must keep a valid profile shape.
  - Events are shape-validated. `organizerId` must be the creator (admins excepted) and can't be reassigned on edit. Counters start at 0 and can't be edited.
  - RSVP/comment docs are shape-validated and must use server timestamps and an existing event.
  - **RSVP delete is denied, though the spec said "write":** cancelling is `status: "not_going"`, so the doc always pairs with `attendeeCount`.
- **Added beyond the spec:** comment `read` for signed-in users. The spec listed none, and the app has to show comments.
- **"Under 500 characters"** is taken literally as `size() < 500`: 499 passes, 500 fails, and both are tested.
- **PII trade-off, following the spec:** `users` read is "signed in", so any signed-in user can list every user's email. If that matters for the demo, the fix is a separate public-profile doc (name/avatar only) with emails readable only by their owner.
- **Counters:** `attendeeCount`/`commentCount` can't be changed by any client right now, not even the ±1 that should go with an RSVP or comment. That's the next piece of work: a client transaction plus a rule that allows exactly ±1, paired with the RSVP/comment write through `getAfter()`. Until then the seeded counts stay accurate, but new RSVPs and comments won't update them.
- **Deleting an event** leaves its RSVP/comment subdocs orphaned. Firestore has no cascade and there's no Cloud Function on Spark. They're unreachable from the app, so this is noted, not fixed.
- **Cost:** each role check is one `get()`, which counts as one document read against the free daily quota. Within one request, repeated `get()`s of the same doc are counted once.
- **Not deployed:** the rules are only verified on the emulator. Deploy with `npm run firebase -- deploy --only firestore:rules` (targets `events-hub-techstartup`).
- **Blaze check:** rules only; nothing needs Blaze.

## Phase 5 — RSVP
**Date:** 2026-09-27
**Summary:** Added a reference `toggleRsvp()` that runs as a client-side `runTransaction`. It reads the event and the caller's RSVP, flips the status, and writes the RSVP plus `attendeeCount: increment(±1)` atomically. Added paired rules so `attendeeCount` can move only by exactly the change the caller's own RSVP makes in the same commit, and emulator race tests proving concurrent RSVPs end with a correct count.
**Files added/changed:**
- Backend/src/services/rsvpService.ts — `toggleRsvp(db, eventId, uid)`, which returns `{status, attendeeCount}`
- Backend/firestore.rules:
  - **Helpers:** `goingDelta`, `callerWasGoing` (`get`), `callerWillBeGoing` (`getAfter`), `attendeeCountMovesBy`.
  - **New events `update` path:** any signed-in user may change only `attendeeCount`, by exactly their own RSVP's non-zero delta, compared against the stored count, and never below 0.
  - **RSVP create/update:** now requires `getAfter(event).attendeeCount == get(event).attendeeCount + delta`.
- Backend/tests/rsvp.emulator.test.ts — 5 tests:
  - one user joining then leaving;
  - 2 users at once, which ends at 2;
  - 5 users at once, which ends at 5;
  - one user on two devices at once, where the count always matches the "going" docs;
  - a naive read-then-write race, where the stale write is rejected and the count stays correct.
- Backend/tests/rules.emulator.test.ts — the fixture event starts at `attendeeCount: 2` to match its RSVPs; RSVP tests now commit the RSVP and counter together; 7 new counter tests
- Backend/package.json — `test:emulator` also runs the RSVP tests
- README.md — "RSVP (client-side transaction)": usage, why a transaction is needed without a server, and what the rules add; the access table is updated
**Commit:** `feat(rsvp): add transaction-safe RSVP toggle with atomic count update`
**Verified:**
- `npm run typecheck`: clean.
- `npm test`: 5/5 pass.
- `npm run test:emulator`: **73/73 pass, on 3 back-to-back runs** (all exit 0, no emulator left listening).
- **Mutation checks** (rules restored byte-identical afterwards):
  - Letting the event counter accept any value failed 2 tests ("can't change attendeeCount without an RSVP change", and "organizer can't edit counters").
  - Dropping the RSVP ↔ counter pairing failed 2 tests (RSVP going without +1, and cancelling without −1).
- `npm run emulators`: "All emulators ready!" with no errors; `npm run seed:emulator` still seeds 4 users, 12 events, 28 RSVPs and 24 comments.
**Notes/decisions:**
- **New negative cases tested:**
  - RSVP going without the +1; cancelling without the −1;
  - changing `attendeeCount` with no RSVP change (as an attendee and as an organizer);
  - moving the count by +2, or the wrong way (for a join or a leave);
  - changing `title` or `commentCount` alongside the counter;
  - a naive stale read-then-write.
- **Why `increment()` rather than "read count + 1":** the first version wrote the absolute value it read inside the transaction. Under a true 5-user race on the emulator, 2–3 of the 5 RSVPs were refused with `permission-denied`. The count never went wrong, but the users got errors. The rules correctly refuse a count computed from a read another RSVP has overtaken, and the emulator reports that as a rule failure, which the SDK doesn't retry, rather than as a retryable contention abort. With `increment(±1)` the server applies the change to the value it holds at commit: 5/5 succeeded over 3 rounds with the right final count. That comparison was a throwaway diagnostic (V0 explicit value, V1 read event + increment, V2 read only the RSVP + increment) and was deleted after use. V1 was chosen because it keeps the requested design (read the event and the RSVP in the transaction).
- **The same account on two devices at the same instant:** the second toggle can be refused with `permission-denied`, because the RSVP it read as missing was created underneath it. The count still always equals the "going" RSVPs; the test asserts this invariant rather than a particular winner. The README tells the frontend to disable the button while a toggle is in flight and to show the error; tapping again works. This is emulator-verified only; production behaviour under this exact race isn't verified.
- **Rule cost:** an RSVP commit makes about 6 document lookups (get/getAfter/exists) across the two writes. That's within the 20-per-batch limit, and each counts as a read against the free quota.
- **Not covered yet:** `commentCount` is still frozen for all clients. That's the comments phase, with the same pairing pattern.
- **Blaze check:** client transaction plus rules only; no Cloud Functions, and nothing needs Blaze.

## Phase 6 — Comments
**Date:** 2026-09-27
**Summary:** Real-time comments need no backend code: the app subscribes with Firestore's own `onSnapshot` on `events/{eventId}/comments`. Added a reference `commentService` that posts or deletes a comment and moves `commentCount` by ±1 in one client-side transaction (the Phase 5 technique). The rules now require that pairing, so the count can't drift without a server trigger.
**Files added/changed:**
- Backend/src/services/commentService.ts — new: `addComment()` (transaction: event exists → create comment with `serverTimestamp()` + `commentCount: increment(1)`) and `deleteComment()` (transaction: comment exists → delete + `increment(-1)`)
- Backend/firestore.rules:
  - `attendeeCountMovesBy` generalised to `counterMovesBy(eventId, field, delta)`;
  - new events update path: `commentCount` alone, by exactly ±1 from the stored value, never below 0;
  - comment create requires `commentCount` +1 in the same commit; comment delete requires −1.
- Backend/tests/comments.emulator.test.ts — new, 5 tests: post then delete (count 1 → 0); 5 users commenting at once → 5; the same comment deleted from two devices at once decrements only once; deleting someone else's comment through the service is refused; an `onSnapshot` listener receives another user's comment live
- Backend/tests/rules.emulator.test.ts — fixture event starts at `commentCount: 2` to match its comments; comment tests now commit the comment and counter together; 4 new counter tests
- Backend/package.json — `test:emulator` also runs the comment tests
- README.md — "Comments (real-time, no server)": `onSnapshot` snippet, `commentService` usage, what the rules enforce and the known limit; access table and scripts table updated
**Commit:** `feat(comments): pair comment writes with atomic commentCount transaction`
**Verified:**
- `npm run typecheck`: clean.
- `npm run test:emulator`: **82/82 pass, on 3 back-to-back runs** (all exit 0, no emulator left listening).
- **Mutation checks** (rules restored byte-identical afterwards): each failed 2 tests.
  - Dropping the create ↔ counter pairing.
  - Dropping the delete ↔ counter pairing.
  - Letting `commentCount` take any value.
- `npm run emulators`: "All emulators ready!" with no errors; `npm run seed:emulator` still seeds 4 users, 12 events, 28 RSVPs and 24 comments.
**Notes/decisions:**
- **Phase 4 comment validation re-checked:** author = caller, exact fields, non-blank text under 500 characters, `createdAt == request.time`, event must exist, no updates, delete by author or admin. All of that was already in place and is unchanged. The only gap was `commentCount`, which Phase 4 froze.
- **New negative cases tested:**
  - posting without the +1, and deleting without the −1 (as a plain write and in a batch);
  - moving the count by +2, or the wrong way (for a post or a delete);
  - changing `title` or `attendeeCount` alongside `commentCount`;
  - setting `commentCount` to 999, or below 0.
- **Known limit (accepted):** comment ids are random, so the event rule can't check that a comment exists in the same commit. A tampered client can nudge `commentCount` by ±1 per write (never below 0) without commenting. Legitimate clients can't drift, because every comment create and delete must carry the ±1. Closing the gap would need a Cloud Function trigger (Blaze, not allowed) or deterministic comment ids, which can collide after deletes. It's accepted because the count is display-only.
- **Deleting a comment on a deleted event** is refused, because the counter check has no event to read. Orphaned comments are cleaned up from the Console. This is the same orphan issue as noted in Phase 4.
- **Blaze check:** `onSnapshot`, client transactions and rules only; no Cloud Functions, and nothing needs Blaze.

## Phase 7 — Testing & API docs
**Date:** 2026-09-27
**Summary:** The Postman/API-docs requirement is met without a custom server. Firestore already exposes every database over HTTPS (`/v1/projects/{id}/databases/(default)/documents/{path}`, `Authorization: Bearer <ID token>`), guarded by the same `firestore.rules`. Added a Postman collection that signs in, performs the allowed reads, and shows the rules refusing requests. Also added an API Documentation section and APA 7 references to the README.
**Files added/changed:**
- Backend/postman_collection.json — new (Postman v2.1), targets the emulators by default:
  - `0. Auth`: Firebase Auth REST `signInWithPassword`; stores `idToken` and `uid`;
  - `1. Allowed reads`: GET `events/evt-01`, list `events?pageSize=5`, GET own `users/{uid}`;
  - `2. Rejected by security rules`: GET with no token (403), GET with an invalid token (400 emulator / 401 production), PATCH another user's profile (403), PATCH own `role` to `admin` (403), then GET own profile to confirm `role` is still `attendee`;
  - every request has `pm.test` assertions; variables switch it to the real project.
- README.md — "API Documentation": why it's Firestore's native REST interface, base URLs (production and emulator), how to run the collection (Postman or `newman`), two ways to get an ID token, each endpoint with an example request and real emulator response, and the rejected-requests table. "References": APA 7 entries for the Firebase docs and the npm packages used (backend and frontend).
**Commit:** `docs(api): add Firestore REST Postman collection, API docs and APA references`
**Verified:**
- `npx -y newman@6 run postman_collection.json` against freshly seeded emulators: **9 requests, 14 assertions, 0 failed**, twice in a row (nothing in the collection writes data, so re-runs are stable).
- Example responses in the README were captured from the same emulator run.
**Notes/decisions:**
- **Emulator vs production differences:** a malformed token returns `400 INVALID_ARGUMENT` on the emulator but `401 UNAUTHENTICATED` on production, so that test accepts either. The emulator's 403 `message` is a rule trace; production returns the generic "Missing or insufficient permissions.". Both were verified in the production run below.
- **Credentials in the collection:** only the seeded emulator demo account (already documented in the README). `idToken` starts empty and is filled at run time; no service account or real token is committed.
- **newman isn't a devDependency:** it's run on demand with `npx`, which keeps the backend install unchanged.
- **APA publish years** come from the npm registry publish date of each installed version. Firebase documentation pages have no publication date, so they are cited as "n.d." with a retrieval date.
- **Blaze check:** REST calls against Firestore and Auth only; nothing needs Blaze.

### Phase 7 follow-up — verified on the real project
**Date:** 2026-09-27
**Summary:** Created the Firestore `(default)` database (`nam5`, production mode) and enabled Email/Password in the Console. Deployed `firestore.rules` and `firestore.indexes.json` to `events-hub-techstartup`, then ran the same collection against production.
**Files changed:**
- Backend/postman_collection.json — test scripts read variables with `pm.variables.get` instead of `pm.collectionVariables.get`. The first production run exposed this: the old calls ignored `--env-var` overrides and compared against the emulator defaults, which failed 2 assertions even though the responses were correct.
- README.md — production run command for newman; the production column of the rejected-requests table is now verified; real production 403 body; deploy step added to "Link the real Firebase project".
**Commit:** `test(api): verify Postman collection against production Firestore`
**Verified on `events-hub-techstartup`:**
- Test data (created through the REST API, not the Admin SDK, so the rules checked every write):
  - 2 test accounts, whose `users/{uid}` profiles were created per the signup contract (200);
  - an attendee creating an event was refused (403), and so was an attendee promoting itself (403);
  - after one account was promoted to `organizer` in the Console, it created an event (200).
- newman against production, signed in as the attendee: **9 requests, 14 assertions, 0 failed**. Production returns 401 for an invalid token and 403 `Missing or insufficient permissions.` for rule denials.
- newman against the seeded emulators after the script change: 9 requests, 14 assertions, 0 failed.
**Notes/decisions:**
- **Role typo caught by the rules:** the first Console promotion saved `role: "tester"`, and event creation was correctly refused until it was corrected to `organizer`. Roles edited by hand aren't validated by the rules (Console edits bypass them), so they must be typed exactly.
- **Test accounts are kept as demo data** (`tester1@…` organizer, `tester2@…` attendee, plus one Networking event). Their password isn't committed.
- **Blaze check:** rules and index deploy plus REST calls; nothing needs Blaze.

## Phase 8 — Security audit
**Date:** 2026-09-27
**Summary:** Went through the 5-item Security & Auth checklist one item at a time, with evidence for each. All 5 pass. The audit found and fixed one test gap (an RSVP guard no test pinned). It also found and contained one leak outside git's main history (the production test password in a local transcript branch).
**Files changed:**
- Backend/tests/rules.emulator.test.ts — new test: "CANNOT write someone else's RSVP even when the count doesn't move"
- README.md — rules test count 82 → 83
**Commit:** `test(rules): pin RSVP self-scoping and record Phase 8 security audit`

**1. No unauthenticated access — PASS**
- Static: every `allow` in `firestore.rules` goes through `isSignedIn()`, `isSelf()` or `isOrganizerOrAdmin()`, and each requires `request.auth != null`. Anything unmatched falls to the catch-all `match /{document=**} { allow read, write: if false; }`. There are no wildcard allows.
- Live on `events-hub-techstartup`: 16 requests with no `Authorization` header, all refused with 403 `PERMISSION_DENIED`, 0 allowed. They covered:
  - get and list for users, events, rsvps and comments;
  - create, update and delete for users and events;
  - an RSVP write and a comment create;
  - read and create on an undeclared `secrets` collection.

**2. Role spoofing is refused — PASS**
- All 7 "role spoofing (self-promotion)" tests pass, plus the 2 signup-contract spoofing tests.
- The tests were checked by mutating the real `firestore.rules`, then restoring it byte-identical to HEAD:
  - removing the signup `role == 'attendee'` guard fails 3 tests;
  - removing both self-update guards (`role` unchanged, and `affectedKeys` limited to `name`/`avatarUrl`) fails 4 tests. Either guard alone still refuses self-promotion, which is defence in depth.
- Live: an attendee's self-promotion to `organizer`/`admin` returns 403 on production (collection and audit probes).

**3. RSVPs and comments act only as yourself — PASS after a fix**
- Negative tests pass: RSVP as someone else, change someone else's RSVP, post a comment as someone else, delete someone else's comment (including as the event's organizer, and through the service).
- **Gap found by mutation:** replacing the RSVP rule's `isSelf(userId)` with `isSignedIn()` failed **0** tests. The existing tests wrote `going` with a ±1 count. The counter rule already refuses those, because it checks the caller's own RSVP. A count-neutral write for someone else, such as setting their `not_going` again or re-saving their `going`, would have passed without `isSelf`. The rule itself was correct, but nothing protected it from a future edit.
- **Fix:** a new test commits count-neutral writes to another user's RSVP and expects them to fail. Re-mutated, it now fails 1 test (the new one). Removing the comment `userId == auth.uid` guard fails 1 test.
- Full suite after the fix: **83/83 pass**. It was run on alternate emulator ports (8081/9100) so the developer's running emulators weren't disturbed.
- **Audit note:** mutating a *copy* of the rules proves nothing. The tests load `firestore.rules` from disk with `readFileSync`, so the first attempt reported 0 failures for every mutation. It was discarded and redone on the real file with a restore trap.

**4. No credential files in git history — PASS**
- All 98 commits on all branches (`main`, `jollimemory/summaries/v3`) were scanned. No file path ever matched `serviceAccount`/`adminsdk`/`.pem`/`.key`/`.env` except `Frontend/.env.example`, whose only version holds non-secret placeholders.
- Content search: 0 commits ever added `BEGIN PRIVATE KEY`, `"private_key"`, `"type": "service_account"`, `client_email` or `firebase-adminsdk`.
- Guards: `Backend/.gitignore` ignores `*serviceAccountKey*.json` and `.env*`; `Frontend/.gitignore` ignores `.env`/`.env.*` except `.env.example`.
- **Related finding, contained:** the Jolli Memory plugin's local branch `jollimemory/summaries/v3` stores conversation transcripts. One of them contains the production test accounts' password, as given in chat during Phase 7. There's no git remote, so it has never left the machine, and it isn't on `main`.
  - The password was **rotated** on both production test accounts: the old one is now rejected and the new one signs in.
  - The new password was never printed. It's stored in `Backend/.env.test-accounts`, which `.env*` ignores (confirmed with `git check-ignore`).
  - The Web API key also appears there; it's public by design (it ships in the app).
  - **Action for submission:** push or zip `main` only. Don't `git push --all`, and don't zip the project with `.git` unless that branch is deleted.

**5. Still on Spark — PASS (evidence), with one visual confirmation left to the owner**
- Of the 41 APIs enabled on the project (read via the Service Usage API), **none is Blaze-only**: no Cloud Functions, Cloud Run, Cloud Build, Artifact Registry, Secret Manager, Eventarc or Cloud Scheduler. The set is the standard one Firebase enables at project creation, plus Firestore, Auth and Rules.
- The Cloud Billing API has never been enabled on the project. It wasn't enabled just to read the plan, so the plan label wasn't read directly.
- Repo: `firebase.json` configures only `firestore` and `emulators`; no `functions/` folder was ever committed. No deploy in any phase asked to upgrade.

**Notes/decisions:**
- **Accepted, not changed:** any signed-in user can read every `users` profile, including email. The app shows organiser names and avatars and needs those reads. Splitting emails into a private sub-document would change the Phase 2 schema. Low risk for a campus events app; revisit if the audience widens.
- **Accepted (from Phase 6):** a tampered client can move `commentCount` by ±1 without commenting. It's display-only, and closing it needs Blaze.
- **Blaze check:** audit reads plus one password rotation through the Auth REST API; nothing needs Blaze.

## Integration Phase — Frontend/Backend Wiring
**Date:** 2026-09-27
**Summary:** The React Native app now talks to Firebase directly (Auth + Firestore, JS SDK v12 modular), and the mock backend, Axios client and JWT session code are gone. Auth uses an `onAuthStateChanged` listener with AsyncStorage persistence, and signup follows the backend signup contract (`role: "attendee"` hardcoded). Events are read from Firestore. RSVP and comment posting are client-side transactions that move `attendeeCount`/`commentCount` atomically. Comments stream live through `onSnapshot`. Emulators are used in `__DEV__` builds (host per platform), and release builds always use production. No backend code changed.
**Files added/changed:**
- Frontend/src/services/firebase.ts — new:
  - app init with the public Web config;
  - `initializeAuth` with React Native persistence;
  - emulator wiring gated on `__DEV__` and `EXPO_PUBLIC_USE_EMULATOR`; host is `10.0.2.2` on Android, `localhost` on iOS/web, or `EXPO_PUBLIC_EMULATOR_HOST` for a physical phone.
- Frontend/src/utils/firestoreDates.ts — new: `toJSDate()` Timestamp → Date, used everywhere a date is formatted.
- Frontend/src/services/errors.ts — new: Firebase error codes mapped to user-safe messages (replaces `ApiError`).
- Frontend/src/services/types.ts — the domain types now match the Firestore schema exactly (`date: Timestamp`, `location: string`, `commentCount`, `imageUrl`, `role`, `avatarUrl`, comment `text`).
- Frontend/src/services/authService.ts — `login` / `signup` (creates `users/{uid}`, deletes the Auth user if that write fails) / `logout` / `subscribeToAuth` / `currentUid`.
- Frontend/src/services/eventsService.ts — `getEvents()` (`orderBy('date')`), `getEventById()`.
- Frontend/src/services/rsvpService.ts — `toggleRsvp()` as a `runTransaction` (reads the event and the caller's RSVP, writes the RSVP and `increment(±1)`); `listMyRsvpEventIds()`; `listAttendees()`.
- Frontend/src/services/commentsService.ts — `subscribeToComments()` (`onSnapshot`, `orderBy('createdAt','desc')`, authors resolved); `addComment()` transaction (comment + `commentCount` +1).
- Frontend/src/services/usersService.ts — `getProfile`, cached `getUser`, `updateMyName`.
- Frontend/src/services/eventsCache.ts — the offline cache stores `date` as epoch ms and rebuilds the Timestamp on read (key bumped to v2).
- Frontend/src/store/authStore.ts — the JWT session is replaced by the auth listener, with `isAuthReady` gating the splash so a restored session never flashes Login; the role is stored from `users/{uid}`; profile editing is name-only.
- Frontend/src/store/eventsStore.ts:
  - an optimistic RSVP is reconciled with the committed `{status, attendeeCount}`;
  - `refreshEvent()` re-reads the open event on open and after a failed RSVP;
  - one shared in-flight `loadEvents`.
- Frontend/src/store/commentsStore.ts — `subscribe(eventId)` returns the unsubscribe; posting relies on the listener instead of a local insert.
- Frontend/src/screens/EventDetailsScreen.tsx — owns the comments listener (`useEffect(() => subscribe(eventId))`, so React unsubscribes on unmount); single date; no capacity bar or tags; the RSVP button disables while in flight.
- Frontend/src/components/EventMap.tsx — geocodes the `location` string with `expo-location`: a **Show on map** button asks for permission first, and if it's denied or the address isn't found it falls back to **Open in Maps** (address search).
- Frontend/src/components/{EventCard,EventListItem,CommentItem,CommentsSection,OrganizerCard,RsvpButton,EditProfileForm,OfflineBanner,AppShell}.tsx, Frontend/src/screens/ProfileScreen.tsx — dates through `toJSDate`, `location` as a string, comment `text`, role badge instead of the headline, `isPending` instead of `isFull`.
- Frontend/src/utils/{date,rsvp,validation}.ts — formatters take `Date`; capacity helpers removed; the profile is name-only.
- Deleted: Frontend/src/services/{api,config,mockApi}.ts, Frontend/src/services/mockData/ (4 files), Frontend/src/components/CapacityBar.tsx.
- Frontend/package.json — +`firebase`, +`expo-location`, −`axios`; +`eslint`/`eslint-config-expo` and a working `lint` script (ESLint called directly: the `&` in the path breaks `.bin` shims). Frontend/eslint.config.js — new (Expo flat config).
- Frontend/tsconfig.json — `paths` maps `@firebase/auth` to its React Native typings (the runtime build that exports `getReactNativePersistence`).
- Frontend/app.json — `expo-location` plugin with the permission text. Frontend/.env.example — `EXPO_PUBLIC_USE_EMULATOR` / `EXPO_PUBLIC_EMULATOR_HOST` replace the mock/API variables.
- README.md — the mock/API-contract section is replaced by "Firebase: emulators vs. production"; tech stack and structure updated.
**Commit:** `feat(integration): wire frontend to Firebase, remove mock data layer and axios/JWT flow`
**Verified:** Run in Expo Go on an Android emulator (Pixel, SDK 57) against the seeded Firebase emulators, driven over adb, with Firestore state read independently after each step.
1. **Signup:** "Test Signup" signed straight in. Firestore has `users/7A71VdPL…` = `{name: "Test Signup", email: "newuser@test.dev", role: "attendee", avatarUrl: ""}`, exactly the 4 schema fields.
2. **Organizer login:** `maya@loopdesk.io` shows the **Organizer** badge on Profile (role read from `users/usr-01`), and her seeded RSVP is listed under My RSVPs.
3. **Browse, search, filter:** "12 of 12 upcoming events", soonest first (Oct 3 → 9 → 15), dates rendered from Timestamps. Networking → 2; Networking + "mixer" → 1. No UI changes were needed for search or filter.
4. **RSVP:** on `evt-01`, `attendeeCount` 2 → **3** and the RSVP became `going` (server `updatedAt`); un-RSVP gave 3 → **2** and `not_going`. The UI matched each committed result ("3 attending", "You + 2 others going", and back).
5. **Comments:**
   - Posting in the app showed "You · just now" and `commentCount` 2 → **3** in Firestore.
   - A second session (Priya, her own ID token, a rules-checked commit) posted while the app sat untouched: her comment appeared live ("just now", count 4) with no refresh, and `commentCount` = **4**.
6. **Session persistence:** after `am force-stop` of Expo Go (process confirmed gone) and a relaunch, the app was still signed in as Maya, not on Login. This was repeated after a later cold start.
7. **Blocked action:** the UI offers no edits to others' comments, so a real rules rejection was triggered instead.
   - Setup: `evt-07.attendeeCount` was set to 0 while Maya's RSVP stayed `going`, and Maya then cancelled her RSVP.
   - The rules refused the commit (SDK log: `Commit … failed with error: permission-denied`, since the count would go below 0). Firestore was unchanged.
   - The app rolled back its optimistic change and showed the banner "You don't have permission to do that.", with no crash (process alive).
   - After the fix below, the screen also resynced to the server count (0).
   - The test data was restored afterwards (`evt-07.attendeeCount` = 2).
- `tsc --noEmit`: clean. ESLint on every file this phase touched: clean.
**Notes/decisions:**
- **The mock types didn't match the schema.** The prompt assumed a plain data-source swap, but the mock model had `startsAt`/`endsAt`, a structured `location` with coordinates, `capacity`, `tags`, and a user `headline`/`interests`, none of which exist in Firestore. The UI was adapted (with the user's agreement) instead of extending the schema, which is frozen and whose rules reject extra fields: start time only, capacity bar and tags removed, profile edit name-only, role badge added.
- **Venue map:** Android geocoding needs the location permission, so the map is opt-in ("Show on map") rather than automatic, with a no-permission "Open in Maps" fallback (verified: it opens Google Maps searching the venue text). The seed addresses are fictional, so pins land on look-alike venues.
- **Bug found during verification and fixed:** opening an event before the list had loaded (a restored screen) discarded the fresh Firestore copy, and a refused RSVP left a stale count on screen. `refreshEvent()`, keyed on the open event id, fixes both; re-verified on the device.
- **My RSVPs** needs one `rsvps/{uid}` read per event: RSVP docs carry no uid field and the rules have no collection-group match (backend frozen). Fine at this size; revisit if events grow into the hundreds.
- **Comment listener cleanup** is enforced structurally (the subscribe return value is the `useEffect` cleanup in EventDetailsScreen). Its unsubscribe firing wasn't observed at runtime, because there's no listener introspection on the emulator.
- **Lint debt left as-is (predates this phase):** 3 errors and 1 warning in files this phase didn't change (`AnimatedMessage`, `BottomSheetModal`: setState in an effect; `OfflineBanner:32`: an unescaped `'`; `navigation/types.ts`: an empty interface). ESLint had never been installed, so these had never been reported.
- **Dev-only noise:** LogBox shows the Firebase SDK's warning log when the rules refuse a commit, and an existing `SafeAreaView` deprecation warning comes from a dependency. Neither appears in release builds.
