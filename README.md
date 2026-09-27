# Local Events Hub

**Theme: Tech & Startup.** A mobile app where founders, developers and students discover local hackathons, meetups and tech events, RSVP to them, and discuss them in real time.

| | |
|---|---|
| `Frontend/` | React Native app (Expo SDK 57, TypeScript) |
| `Backend/` | Firebase on the free Spark plan: Firestore Security Rules, emulator config, seed scripts, rules tests, Postman collection |
| `GIT_HISTORY.md` | Phase-by-phase development log: what was built, why, and how each phase was verified |

---

## 1. Title & One-Line Description

**Local Events Hub (Tech & Startup edition):** a cross-platform mobile app for discovering, RSVPing to and discussing local tech and startup events: hackathons, networking nights, workshops, pitch nights, demo days and panels.

---

## 2. Project Goal

<!-- TODO: compare this framing with the "Project Goal" section of the assignment brief (the brief is not in the repo) and adjust the wording if needed. -->

We approached this project as a small startup team building a real product: a **Local Events Hub** for one community, designed from day one to be **scalable, secure and specific to its theme**. The goal was a platform where a local community can find out what is happening near them, commit to attending, and talk about it, with an architecture that could grow beyond a class demo.

In practice that meant:
- a managed, horizontally scaling backend (Cloud Firestore + Firebase Authentication) instead of a single self-hosted server;
- an access-control model enforced on the server side by Firestore Security Rules, not by trusting the app;
- data-integrity guarantees (atomic transactions for shared counters) that hold even when many people act at the same moment;
- a UI and dataset built specifically around one audience: the local tech and startup scene.

---

## 3. Theme Rationale

**Theme: Tech & Startup — Hackathons, meetups, tech events.**

We chose this theme because it's the community our team is part of. University tech students, early-stage founders and developers rely on local events (hackathons, founder meetups, demo days) to find collaborators, co-founders and jobs, but those events are scattered across many channels. The theme runs through the whole app:

- **Event categories.** Every event belongs to one of six categories, defined in `Frontend/src/services/types.ts` and enforced by `Backend/firestore.rules`: **Hackathon, Networking, Workshop, Demo Day, Panel, Pitch Night**. Each has its own icon and a filter chip on the Discover screen.
- **Sample data.** The seed script (`Backend/scripts/seedData.ts`) creates 12 realistic local events, 2 per category, for example "Build Weekend: 48h AI Hackathon", "Founders & Coffee", "Tech Mixer: Devs × Designers" and "SaaS Demo Day & Year-end Mixer". It also adds 4 personas (organizers from a co-working space and a builder club, a student, and a startup engineer) plus RSVPs and comments that read like a real community.
- **Colour palette** (`Frontend/src/theme/colors.ts`). The palette is deliberately "developer tool / startup": a near-black canvas like a code editor in dark mode, with an electric violet primary and a cyan accent.

  | Token | Hex | Use |
  |---|---|---|
  | Primary | `#6C5CE7` | Buttons, active states, highlights (both modes) |
  | Accent | `#22D3EE` | Secondary highlights, glows |
  | Ink (dark background / light text) | `#0B0E14` | Dark-mode canvas, light-mode text |
  | Paper (light background / dark text) | `#F5F6FA` | Light-mode canvas, dark-mode text |
  | Surface (dark / light) | `#151925` / `#FFFFFF` | Cards |
  | Success | `#3DDC97` | Positive states |
  | Error | `#FF6B6B` | Errors (darkened to `#C53030` for text in light mode) |

  Light mode is designed as its own palette rather than a simple inversion. Its colour roles were checked against WCAG contrast (see `GIT_HISTORY.md`, frontend Phase 10).
- **Typography** (`Frontend/src/theme/typography.ts`). **Space Grotesk** (500/600/700) for headings, a geometric grotesque with a technical feel, and **Inter** (400/500/600) for body text, chosen for legibility on small screens. Both are loaded through `@expo-google-fonts`.

---

## 4. Core Features

The five core features, as built (see `GIT_HISTORY.md` for each phase):

1. **Login / signup (authentication).**
   - Email and password go through **Firebase Authentication**; the app never stores passwords.
   - Signup creates the Auth account, then immediately writes the user's profile to `users/{uid}` with the role hard-coded to `attendee`. If that write fails, the account is deleted again.
   - The app then returns to the Login screen, so the user signs in explicitly.
   - Sessions persist across app restarts (Firebase Auth's AsyncStorage persistence), restored through an `onAuthStateChanged` listener.
2. **Event discovery.**
   - The Discover screen loads the `events` collection from Firestore, ordered by `date`.
   - It supports title search and category filter chips.
   - Event details show the date, venue, host, attendee faces and description.
   - The venue can be placed on a map: the address text is geocoded on the device with `expo-location`, with an "Open in Maps" fallback.
   - The list is cached on the device, so it still shows (with an offline banner) when the network is down.
3. **RSVP.**
   - Implemented as a Firestore **client-side transaction**: it reads the event and the user's own RSVP, flips `going` ↔ `not_going`, and writes the RSVP and `attendeeCount: increment(±1)` in one atomic commit.
   - This way, concurrent RSVPs from different devices can't corrupt the attendee count. The security rules additionally reject any count change that isn't exactly this user's ±1.
   - The UI updates instantly (optimistically), then adopts the committed result, or rolls back and shows an error.
4. **Real-time commenting.**
   - Comments stream live through Firestore's `onSnapshot` listener on `events/{id}/comments`, so a comment posted on one device appears on every open screen without refreshing.
   - The listener is removed when the screen closes.
   - Posting is a transaction that creates the comment and increments the event's `commentCount` atomically. The rules refuse a comment without the matching +1.
5. **Profile.**
   - Shows the user's name, email, role badge (Organizer/Admin, read from `users/{uid}.role`) and a "My RSVPs" list.
   - Users can edit their name; the rules allow only `name`/`avatarUrl` changes and never `role` or `email`.
   - Settings has a dark/light theme switch and logout.

---

## 5. Tech Stack

### Frontend

From `Frontend/package.json`; versions are the ones installed.

| Library | Version | Purpose |
|---|---|---|
| React Native | 0.86.3 | Cross-platform mobile UI |
| Expo (managed workflow) | SDK 57 (`expo` 57.0.25) | Tooling, dev server, native modules |
| React | 19.2.3 | UI library |
| TypeScript | 6.0.3 | Static typing |
| Firebase JS SDK (modular) | 12.19.0 | Auth + Firestore client |
| React Navigation (`native`, `native-stack`, `bottom-tabs`) | 7.4.1 / 7.19.2 / 7.19.2 | Navigation: auth stack, tabs, event stack |
| Zustand | 5.0.15 | State management (auth, events, comments stores) |
| react-native-reanimated + react-native-worklets | 4.5.1 + 0.10.1 | Animations |
| moti | 0.30.0 | Declarative animations on top of Reanimated |
| @react-native-async-storage/async-storage | 2.2.0 | Auth session persistence, offline event cache |
| expo-location | 57.0.20 | Geocoding venue addresses |
| react-native-maps | 1.27.2 | Venue map preview |
| react-native-screens / react-native-safe-area-context | 4.26.2 / 5.7.0 | Native screens, safe areas |
| expo-font, @expo-google-fonts/space-grotesk, @expo-google-fonts/inter | 57.0.4, 0.4.1, 0.4.2 | Custom fonts |
| expo-splash-screen, expo-status-bar, @expo/vector-icons | 57.0.9, 57.0.1, 15.1.1 | Splash, status bar, icons (Ionicons) |
| ESLint + eslint-config-expo (dev) | 9.39.5, 57.0.2 | Linting |

### Backend

From `Backend/package.json`.

| Technology | Version | Purpose |
|---|---|---|
| Cloud Firestore | — | Document database |
| Firebase Authentication (Email/Password) | — | User accounts and ID tokens |
| Firestore Security Rules (`Backend/firestore.rules`) | rules_version 2 | Access control and data validation |
| Firebase Local Emulator Suite (`firebase-tools`) | 15.31.0 | Local Auth + Firestore + Emulator UI |
| firebase-admin | 14.5.0 | Emulator-only seed script |
| @firebase/rules-unit-testing + firebase (client SDK) | 5.0.2 + 12.19.0 | Security-rules and race-condition tests |
| TypeScript | 7.0.2 | Scripts and tests (run directly by Node 22.18+, no build step) |
| Postman / newman | v2.1 collection / newman 6 (via `npx`) | API documentation and checks |

**Architecture (a deliberate choice, not an omission):**
- The backend runs entirely on Firebase's free **Spark plan**, with **no Cloud Functions and no custom server**.
- The app talks to Firestore **directly through the client SDK**, and **Firestore Security Rules are the access-control layer**. Every read and write, from the app or from any HTTP client, is checked on Google's servers against `firestore.rules`.
- Work a server would normally do is handled without one:
  - role checks happen in the rules, which read `users/{uid}.role`;
  - shared counters are kept consistent with client-side transactions plus rules that verify each ±1;
  - real-time updates come from Firestore's own listeners.
- This keeps the backend free, removes a whole tier to host and secure, and scales automatically. The trade-offs (such as the `commentCount` limit in Section 8) are documented where they arise.

---

## 6. Setup Guide

These steps run the full stack locally against the **Firebase emulators**, with no Firebase account needed. Step 4 covers the real Firebase project, which is optional.

> **Windows note:** the repo folder name contains `&`, which breaks `npx` and npm's `.bin` shims on Windows. Every command below uses the `npm run` scripts, which call the tools through `node` directly. Don't substitute `npx expo …` or `npx firebase …`.

### 1. Prerequisites

- **Node.js 22.18 or newer.** `Backend/package.json` requires `>=22.18`; the frontend runs on the same version.
- **Java 21 or newer.** The Firestore emulator runs on the JVM; `firebase-tools` 15.31 enforces Java 21 as a minimum.
- **Git**.
- **Expo CLI and Firebase CLI:** no global install needed. Both come as local dependencies (`expo` in `Frontend/`, `firebase-tools` in `Backend/`) and are called through the npm scripts.
- **A device to run the app on**, one of:
  - an **Android emulator** (Android Studio) with **Expo Go** installed. This is what the app was verified on.
  - an **iOS simulator** (macOS with Xcode) with Expo Go.
  - a **physical phone** with Expo Go on the same Wi-Fi as your computer.

### 2. Clone the repository

<!-- TODO: replace <repo-url> with the real repository URL (no git remote is configured in this repo yet). -->

```bash
git clone <repo-url> "Tech & Startup"
cd "Tech & Startup"
```

Frontend and backend live in one repository, in `Frontend/` and `Backend/`.

### 3. Install dependencies

```bash
cd Backend
npm install
cd ../Frontend
npm install
```

### 4. Firebase setup

**For local development, nothing is needed.** The emulators use the offline project `demo-local-events-hub`, and the app connects to them automatically in development builds.

**To use a real Firebase project** (Spark plan):

1. In the [Firebase Console](https://console.firebase.google.com), create a project. It starts on Spark; don't upgrade it or add billing.
2. **Build → Firestore Database → Create database**: database ID `(default)`, location of your choice (`Backend/firebase.json` uses `nam5`), and **production mode** (deny all).
3. **Build → Authentication → Sign-in method**: enable **Email/Password**.
4. **Project settings → Your apps → Web (`</>`)**: register a web app and copy its `firebaseConfig`.
5. Put that config in **`Frontend/src/services/firebase.ts`** (the `firebaseConfig` object). This is the pattern the repo uses. The web config is public client configuration, not a secret, so it's committed; access is enforced by Auth and the security rules. The committed file already holds the config for our project, `events-hub-techstartup`.
6. Link the CLI and deploy the security rules from `Backend/`:

   ```bash
   npm run firebase -- login
   npm run firebase -- use --add
   npm run firebase -- deploy --only firestore:rules,firestore:indexes --project <your-project-id>
   ```

   Until the rules are deployed, the database keeps the Console's deny-all default.

**Never commit a service account key** (`serviceAccountKey.json`): it bypasses all security rules. Nothing in this repo needs one. `Backend/.gitignore` blocks `*serviceAccountKey*.json` and `.env*`.

### 5. Run the Firebase emulators

In terminal 1:

```bash
cd Backend
npm run emulators
```

This starts:
- the Auth emulator at `127.0.0.1:9099`;
- the Firestore emulator at `127.0.0.1:8080`;
- the **Emulator UI** at **http://127.0.0.1:4000**, where you can browse accounts and Firestore data.

### 6. Seed the demo data

In terminal 2, with the emulators running:

```bash
cd Backend
npm run seed:emulator
```

(`scripts/seed.ts`, data in `scripts/seedData.ts`.) It wipes the emulators, then creates **4 users** (Auth accounts plus `users` docs), **12 events**, **28 RSVPs** and **24 comments**. Every seeded account uses the password **`startup123`**:

| Account | Role |
|---|---|
| `maya@loopdesk.io` | organizer |
| `daniel@buildspace.club` | organizer |
| `priya@student.uni.edu` | attendee |
| `liam@stackpilot.app` | attendee |

The seed script refuses to run against anything but local emulators with a `demo-` project, and refuses if `GOOGLE_APPLICATION_CREDENTIALS` is set. Emulator data is kept in memory only, so **re-run the seed after every emulator restart**.

### 7. Run the app

In terminal 3:

```bash
cd Frontend
npm start
```

Then:
- **Android emulator:** press `a` in the terminal, or open Expo Go and enter the URL shown.
- **iOS simulator:** press `i`.
- **Physical phone:** scan the QR code with Expo Go (Android) or the Camera app (iOS). This also needs the setting in step 8.

Log in with a seeded account; the Login screen shows `maya@loopdesk.io / startup123` as a hint in development. Or create a new account: after signup the app returns to Login so you can sign in.

### 8. Switch between emulator and production Firebase

Controlled by `Frontend/src/services/firebase.ts`, configured through `Frontend/.env`. Copy `Frontend/.env.example` to `Frontend/.env`, then restart `npm start` after any change.

| Build | Talks to |
|---|---|
| Development build (`npm start`), default | **Local emulators** (project `demo-local-events-hub`) |
| Development build with `EXPO_PUBLIC_USE_EMULATOR=false` | **Real project** (`events-hub-techstartup`) |
| Release build | **Always the real project**: the emulator code only runs when `__DEV__` is true |

The emulator host is chosen per platform: `10.0.2.2` on an Android emulator, `localhost` on an iOS simulator or web. **On a physical phone**, set `EXPO_PUBLIC_EMULATOR_HOST=<your computer's LAN IP>` in `Frontend/.env`.

**Useful scripts**

| Where | Command | What it does |
|---|---|---|
| `Frontend/` | `npm start` | Start the Expo dev server |
| `Frontend/` | `npm run android` / `ios` / `web` | Start and open on a platform |
| `Frontend/` | `npm run typecheck` | TypeScript check |
| `Frontend/` | `npm run lint` | ESLint |
| `Backend/` | `npm run emulators` | Start the Auth + Firestore emulators and Emulator UI |
| `Backend/` | `npm run seed:emulator` | Wipe and re-seed the emulators |
| `Backend/` | `npm test` | Unit tests (no emulator needed) |
| `Backend/` | `npm run test:emulator` | Start throwaway emulators, run the rules and race-condition tests, stop them |
| `Backend/` | `npm run typecheck` | TypeScript check |

**Promoting a user to organizer or admin.** Everyone signs up as `attendee`, and there is no in-app promotion screen. To promote someone for a demo, change `users/{uid}.role` in the Emulator UI (http://127.0.0.1:4000/firestore) or the Firebase Console. Those edits use admin access, so the no-self-promotion rule doesn't block them. Type the value exactly: `organizer` or `admin`.

---

## 7. Database / Data Model

The data model is defined once in **`Backend/src/types.ts`** and mirrored by the app in **`Frontend/src/services/types.ts`**. Field names match exactly. In both, the document id lives in the path, not the document body; the app adds it as `id` when reading.

```
users/{userId}
events/{eventId}
events/{eventId}/rsvps/{userId}        ← doc id is the attendee's uid
events/{eventId}/comments/{commentId}
```

**`users/{userId}`** (`User`)

| Field | Type | Notes |
|---|---|---|
| `name` | string | 1–80 characters, trimmed (enforced by the rules) |
| `email` | string | Must equal the Auth account's email; can never change |
| `role` | `'attendee' \| 'organizer' \| 'admin'` | Always `attendee` at signup |
| `avatarUrl` | string | Up to 2048 characters; `""` at signup |

**`events/{eventId}`** (`Event`)

| Field | Type | Notes |
|---|---|---|
| `title` | string | Non-blank, up to 120 characters |
| `description` | string | Non-blank, up to 5000 characters |
| `date` | Timestamp | Start date and time. The app converts it with `toJSDate()` (`Frontend/src/utils/firestoreDates.ts`). |
| `location` | string | Venue and address as one string; non-blank, up to 200 characters |
| `category` | `'Hackathon' \| 'Networking' \| 'Pitch Night' \| 'Workshop' \| 'Demo Day' \| 'Panel'` | |
| `organizerId` | string | uid of the organizer who owns the event |
| `attendeeCount` | int ≥ 0 | Starts at 0; moves only with RSVPs |
| `commentCount` | int ≥ 0 | Starts at 0; moves only with comments |
| `imageUrl` | string | Up to 2048 characters |

**`events/{eventId}/rsvps/{userId}`** (`Rsvp`)

| Field | Type | Notes |
|---|---|---|
| `status` | `'going' \| 'not_going'` | Cancelling sets `not_going`; RSVPs are never deleted |
| `updatedAt` | Timestamp | Server time (`serverTimestamp()`) |

**`events/{eventId}/comments/{commentId}`** (`Comment`)

| Field | Type | Notes |
|---|---|---|
| `userId` | string | Author's uid; must be the caller |
| `text` | string | Non-blank, under 500 characters (the app caps it at 280) |
| `createdAt` | Timestamp | Server time (`serverTimestamp()`) |

**Denormalised counters.** `attendeeCount` and `commentCount` are stored on the event so lists can show them without counting subcollections. They are kept consistent by transactions (Section 4) and checked by the rules (Section 8).

**Indexes.** None beyond Firestore's automatic single-field indexes (`Backend/firestore.indexes.json`).

**Database dump.** This project uses Firestore, not SQL, so the "database dump" submitted with this project is a **Firestore export** rather than a `.sql` file. See the Submission Checklist (Section 11) for how it's produced and where it lives.

---

## 8. Security Model

There is no custom server, so **Firestore Security Rules (`Backend/firestore.rules`) are the security layer**. They run on Google's servers for every request, whether it comes from the app, a modified app or a hand-written HTTP call, so the app itself is never trusted.

**Authentication: Firebase Authentication (Email/Password).**
- Passwords are handled entirely by Firebase Auth, which stores them salted and hashed. They never reach Firestore or the app's storage.
- A signed-in client holds a Firebase **ID token**, a signed JWT that expires after 1 hour and is refreshed automatically. Every Firestore request carries it, and the rules read the caller from `request.auth`.
- On the device, only session tokens are stored (AsyncStorage), never the password.

**Authorization: role-based (attendee / organizer / admin).**
- **Deny by default.** The last match in the rules, `match /{document=**} { allow read, write: if false; }`, refuses everything not explicitly allowed. Every allow rule requires a signed-in caller, so **nothing is readable or writable without logging in**. This was checked live against the production database: 16 of 16 unauthenticated requests were refused.
- **Roles live in `users/{uid}.role`** and are read live by the rules (`callerRole()` does a `get()` on the caller's own profile). The Spark plan has no Cloud Functions to set custom claims, so the profile document is the source of truth, which is why protecting that field matters.

| Path | Read | Create | Update | Delete |
|---|---|---|---|---|
| `users/{uid}` | signed in | own uid only; `role` must be `attendee`; `email` must be the account's own | own `name`/`avatarUrl` only; admins may change `role` | nobody |
| `events/{id}` | signed in | organizer or admin; as themselves (admins: anyone); counters start at 0 | owner organizer or admin; can't hand off ownership (admins can) or edit counters. Separately, any signed-in user may move `attendeeCount` by exactly their own RSVP's ±1, or `commentCount` by ±1. | owner organizer or admin |
| `events/{id}/rsvps/{uid}` | signed in | own uid only; paired with the matching `attendeeCount` change | own only, same checks | nobody |
| `events/{id}/comments/{cid}` | signed in | as yourself only; paired with `commentCount` +1 | nobody (comments are immutable) | author or admin; paired with `commentCount` −1 |

**Users cannot promote themselves.** This is the most important rule, because there's no server enforcing roles.
- **At signup** (`allow create` on `users/{userId}`): the new profile's `role` must be exactly `'attendee'`, the document id must be the caller's own uid, and `email` must equal the email in the caller's token. A client can't sign up as an organizer or admin, or create a profile for someone else.
- **On update** (`allow update` on `users/{userId}`): a user editing their own profile must leave `role` unchanged (`request.resource.data.role == resource.data.role`) and may only change `name` and `avatarUrl` (`affectedKeys().hasOnly(['name', 'avatarUrl'])`). Either check alone blocks self-promotion; having both is defence in depth.
- **Only an admin** (`isAdmin()`, checked against the caller's stored role) may change someone's role. Organizers can't promote themselves or anyone else.
- **Tests.** Seven dedicated "role spoofing" tests cover these cases, and deleting each guard in turn makes them fail (mutation-tested in Phase 8). The rejection was also confirmed on the live project: an attendee's attempt to set their role to `admin` got `403 PERMISSION_DENIED`.

**Acting only as yourself.**
- RSVP documents are keyed by uid and writable only when that uid is the caller.
- Comments must carry `userId == request.auth.uid`.
- A comment can be deleted only by its author or an admin, not even by the event's organizer.

**Data integrity.** Counter changes must be paired with the RSVP or comment that justifies them, checked against the stored value (`counterMovesBy`, `goingDelta`), so a tampered client can't inflate or deflate counts through RSVPs. Counters can never go below 0.

**Input validation and sanitisation.** Two layers; the second is the one that can't be bypassed:
- **Client-side, for fast feedback** (`Frontend/src/utils/validation.ts`, `Frontend/src/utils/sanitize.ts`):
  - email format;
  - password at least 8 characters;
  - name required and under 60 characters;
  - comments stripped of `<script>` blocks, HTML tags and control characters, extra blank lines collapsed, capped at 280 characters.
- **Rules-level, enforced by the server** (`firestore.rules`):
  - **exact document shapes:** `hasOnly` + `hasAll`, so extra or missing fields are rejected;
  - **types and lengths:** name 1–80; title ≤ 120; description ≤ 5000; location ≤ 200; URLs ≤ 2048; comment text non-blank and < 500;
  - **allowed values:** role; category; RSVP status;
  - **server timestamps only:** `createdAt`/`updatedAt` must equal `request.time`, so clients can't backdate;
  - **existence:** the event must exist for RSVPs and comments.
- The app renders text with React Native `<Text>`, which never interprets HTML, so stored text can't inject markup.

**Tests.** A fresh run of `npm run test:emulator` gives **83 / 83 emulator tests passing** (66 security-rules tests, 7 signup-contract tests, 5 RSVP race-condition tests, 5 comment race-condition tests), plus **5 / 5** unit tests from `npm test`. The rules tests cover every allow and deny path in the table above. See `Backend/tests/`.

**Accepted limits (documented rather than hidden):**
- **`commentCount` nudging.** Comment ids are random, so the rules can't tell whether a lone `commentCount` ±1 comes with a real comment. A tampered client could nudge the display count by 1 per write (never below 0). Closing this needs a Cloud Function (Blaze plan). It's accepted because the count is display-only; the actual comments are protected.
- **Profile visibility.** Any signed-in user can read other users' profiles, including email, because the app shows organizer and attendee names and avatars.

**Secrets.** The committed Firebase web config is public by design. No service account key exists in the repo or its history; this was checked across all commits in the Phase 8 security audit.

---

## 9. API Documentation

**There is no custom REST server.** In this project, "API" means two things:

1. **Firestore's own REST interface.** Every Firestore database is automatically reachable over HTTPS at `https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{path}`, authenticated with `Authorization: Bearer <Firebase ID token>`. The same `firestore.rules` check every REST request.
2. **The client SDK operations the app performs** (Firebase JS SDK, `Frontend/src/services/`). They hit the same service under the same rules.

| | Production | Local emulators |
|---|---|---|
| Firestore base URL | `https://firestore.googleapis.com/v1` | `http://127.0.0.1:8080/v1` |
| Auth base URL | `https://identitytoolkit.googleapis.com/v1` | `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1` |
| Project id | `events-hub-techstartup` | `demo-local-events-hub` |

### Postman collection

**`Backend/postman_collection.json`** (Postman collection v2.1) contains every request in this section, with test assertions. It targets the emulators by default.

1. Start and seed the emulators (Section 6, steps 5–6).
2. Either import the file into Postman (**Import → File**) and run the collection in order, or run it from `Backend/` with the Postman CLI:

   ```bash
   npx -y newman@6 run postman_collection.json
   ```

   Expected result: **9 requests, 14 assertions, 0 failed**.

To run it against the real project, override the collection variables. Values in `<…>` are placeholders:

```powershell
npx -y newman@6 run postman_collection.json `
  --env-var "firestoreBase=https://firestore.googleapis.com/v1" `
  --env-var "authBase=https://identitytoolkit.googleapis.com/v1" `
  --env-var "projectId=events-hub-techstartup" `
  --env-var "apiKey=<Web API key>" `
  --env-var "email=<an attendee account>" --env-var "password=<its password>" `
  --env-var "eventId=<an existing event id>" --env-var "otherUserId=<another user's uid>"
```

This was run on the emulators and on `events-hub-techstartup` (2026-09-27): 9 requests, 14 assertions, 0 failed on both.

### Getting an ID token

- **In the app:** the Firebase Auth SDK handles tokens (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`), and the SDK attaches them to every request.
- **For REST / Postman:** use the Firebase Auth REST endpoint `signInWithPassword`. The collection's first request does this and stores `idToken` and `uid` for the rest. The token lasts 1 hour.

```http
POST {authBase}/accounts:signInWithPassword?key={WEB_API_KEY}
Content-Type: application/json

{ "email": "priya@student.uni.edu", "password": "startup123", "returnSecureToken": true }
```

```json
{ "localId": "usr-05", "email": "priya@student.uni.edu", "idToken": "eyJhbGciOi…", "refreshToken": "…", "expiresIn": "3600" }
```

The Web API key is in **Project settings → General**; it isn't a secret. The Auth emulator accepts any key, for example `fake-api-key`.

### Operations

| Operation | Collection path | App (SDK) call | Auth requirement | In Postman |
|---|---|---|---|---|
| Sign up | Auth, then `users/{uid}` | `createUserWithEmailAndPassword`, `setDoc` (`authService.signup`) | none, then own uid | — |
| Log in | Auth | `signInWithEmailAndPassword` (`authService.login`) | none | ✅ Sign in |
| List events | `events` | `getDocs(query(…, orderBy('date')))` (`eventsService.getEvents`) | signed in | ✅ |
| Read one event | `events/{eventId}` | `getDoc` (`eventsService.getEventById`) | signed in | ✅ |
| Read own profile | `users/{uid}` | `getDoc` (`usersService.getProfile`) | signed in | ✅ |
| Update own name | `users/{uid}` | `updateDoc({ name })` (`usersService.updateMyName`) | own uid; `name`/`avatarUrl` only | ✅ (rejected cases) |
| RSVP / cancel | `events/{id}/rsvps/{uid}` + `events/{id}` | `runTransaction` (`rsvpService.toggleRsvp`) | own uid; paired ±1 | — (SDK tests) |
| Read comments (live) | `events/{id}/comments` | `onSnapshot(query(…, orderBy('createdAt','desc')))` (`commentsService.subscribeToComments`) | signed in | — |
| Post comment | `events/{id}/comments` + `events/{id}` | `runTransaction` (`commentsService.addComment`) | as self; paired +1 | — (SDK tests) |

RSVP and comment writes are multi-document transactions, which the app performs through the SDK. They're exercised by the SDK-based rules and race-condition tests in `Backend/tests/`, not by single Postman requests.

### Example requests and responses

These come from the Postman collection. The responses are real emulator output from the seeded data, shortened with `…`. Firestore REST uses typed JSON (`stringValue`, `integerValue`, `timestampValue`…).

**Read one event:** `GET {base}/projects/{PROJECT_ID}/databases/(default)/documents/events/{eventId}`. Any signed-in user.

```http
GET /v1/projects/demo-local-events-hub/databases/(default)/documents/events/evt-01
Authorization: Bearer {idToken}
```

```json
{
  "name": "projects/demo-local-events-hub/databases/(default)/documents/events/evt-01",
  "fields": {
    "title": { "stringValue": "Build Weekend: 48h AI Hackathon" },
    "description": { "stringValue": "Form a team on Friday night, ship an AI-powered prototype by Sunday afternoon. …" },
    "date": { "timestampValue": "2026-10-09T17:00:00Z" },
    "location": { "stringValue": "The Foundry Co-working, 12 Market Street, 3rd Floor" },
    "category": { "stringValue": "Hackathon" },
    "organizerId": { "stringValue": "usr-04" },
    "attendeeCount": { "integerValue": "2" },
    "commentCount": { "integerValue": "2" },
    "imageUrl": { "stringValue": "https://picsum.photos/seed/evt-01/800/450" }
  },
  "createTime": "2026-09-27T02:16:53.316255Z",
  "updateTime": "2026-09-27T02:16:53.316255Z"
}
```

**List events:** `GET {base}/projects/{PROJECT_ID}/databases/(default)/documents/events?pageSize=5`. Any signed-in user. Pass `nextPageToken` as `pageToken` for the next page.

```http
GET /v1/projects/demo-local-events-hub/databases/(default)/documents/events?pageSize=5
Authorization: Bearer {idToken}
```

```json
{
  "documents": [
    { "name": "projects/demo-local-events-hub/databases/(default)/documents/events/evt-01", "fields": { "title": { "stringValue": "Build Weekend: 48h AI Hackathon" }, "…": "…" } },
    { "name": "projects/demo-local-events-hub/databases/(default)/documents/events/evt-02", "fields": { "…": "…" } }
  ],
  "nextPageToken": "…"
}
```

**Read own profile:** `GET {base}/projects/{PROJECT_ID}/databases/(default)/documents/users/{uid}`, where `{uid}` is the `localId` from sign-in.

```http
GET /v1/projects/demo-local-events-hub/databases/(default)/documents/users/usr-05
Authorization: Bearer {idToken}
```

```json
{
  "name": "projects/demo-local-events-hub/databases/(default)/documents/users/usr-05",
  "fields": {
    "name": { "stringValue": "Priya Raman" },
    "email": { "stringValue": "priya@student.uni.edu" },
    "role": { "stringValue": "attendee" },
    "avatarUrl": { "stringValue": "https://api.dicebear.com/9.x/initials/png?seed=Priya%20Raman" }
  },
  "createTime": "2026-09-27T02:16:53.316255Z",
  "updateTime": "2026-09-27T02:16:53.316255Z"
}
```

### Rejected requests (the security rules at work)

The collection's **2. Rejected by security rules** folder shows the database refusing requests even though anyone can reach the URL:

| Request | Why it's refused | Emulator | Production |
|---|---|---|---|
| `GET …/events/evt-01` with **no** `Authorization` header | every read requires `request.auth != null` | `403 PERMISSION_DENIED` | `403 PERMISSION_DENIED` |
| `GET …/events/evt-01` with `Bearer not-a-real-token` | not a valid Firebase ID token | `400 INVALID_ARGUMENT` | `401 UNAUTHENTICATED` |
| `PATCH …/users/usr-01?updateMask.fieldPaths=name` as Priya (`usr-05`) | users may only update their own profile | `403 PERMISSION_DENIED` | `403 PERMISSION_DENIED` |
| `PATCH …/users/usr-05?updateMask.fieldPaths=role` with `"admin"` as Priya | users can never change their own `role` | `403 PERMISSION_DENIED` | `403 PERMISSION_DENIED` |

A follow-up `GET` confirms Priya's `role` is still `attendee`. Example wrong-user write:

```http
PATCH /v1/projects/demo-local-events-hub/databases/(default)/documents/users/usr-01?updateMask.fieldPaths=name
Authorization: Bearer {idToken of usr-05}
Content-Type: application/json

{ "fields": { "name": { "stringValue": "Hacked" } } }
```

Production response. The emulator returns a rule trace in `message` instead, with the same `status`:

```json
{ "error": { "code": 403, "message": "Missing or insufficient permissions.", "status": "PERMISSION_DENIED" } }
```

---

## 10. Team Roles & Contributions

| Name | Role | Key Contributions |
|---|---|---|
| Mahendra Buda | developer | _e.g. Screens & navigation: Login, Signup, Events List, Event Details, Profile, Settings (`Frontend/src/screens`, `Frontend/src/navigation`)_ |
| Rajbir Singh | developer and uix | _e.g. UI components & theming: reusable components, dark mode, animations (`Frontend/src/components`, `Frontend/src/theme`)_ |
| Arshdeep Singh | developer and backend | _e.g. Firebase backend & security: Firestore rules, role management, emulator tests (`Backend/firestore.rules`, `Backend/tests`)_ |
| Jasveer Singh | developer and database | _e.g. Data & state: services, Zustand stores, RSVP/comments real-time logic, offline cache, seed data (`Frontend/src/services`, `Frontend/src/store`, `Backend/scripts`)_ |
| Sumit Pant | Repository & Submission Lead | Set up the GitHub repository and pushed the full commit history; produced the Firebase database export (`firebase-export/`); verified the local setup guide on Windows and fixed emulator access for physical devices (`Backend/firebase.json`); finalised README documentation |

All commits were made from a single shared local repository and so appear under one Git author. Contributions above are as agreed by the team.
---


## 11. References (APA 7th)

<!-- Package versions are the installed versions (Frontend/package.json and Backend/package.json); years are the npm publish dates of those versions. Documentation pages have no publication date, so they are cited as n.d. with a retrieval date. -->

Duplessis, J. (2026). *react-native-safe-area-context* (Version 5.7.0) [Computer software]. npm. https://www.npmjs.com/package/react-native-safe-area-context

ESLint contributors. (2026). *eslint* (Version 9.39.5) [Computer software]. npm. https://www.npmjs.com/package/eslint

Expo. (n.d.-a). *Location*. Expo documentation (SDK 57). Retrieved September 27, 2026, from https://docs.expo.dev/versions/v57.0.0/sdk/location/

Expo. (n.d.-b). *Using Firebase*. Expo documentation. Retrieved September 27, 2026, from https://docs.expo.dev/guides/using-firebase/

Expo. (2025a). *@expo-google-fonts/inter* (Version 0.4.2) [Computer software]. npm. https://www.npmjs.com/package/@expo-google-fonts/inter

Expo. (2025b). *@expo-google-fonts/space-grotesk* (Version 0.4.1) [Computer software]. npm. https://www.npmjs.com/package/@expo-google-fonts/space-grotesk

Expo. (2026a). *eslint-config-expo* (Version 57.0.2) [Computer software]. npm. https://www.npmjs.com/package/eslint-config-expo

Expo. (2026b). *expo* (Version 57.0.25) [Computer software]. npm. https://www.npmjs.com/package/expo

Expo. (2026c). *expo-font* (Version 57.0.4) [Computer software]. npm. https://www.npmjs.com/package/expo-font

Expo. (2026d). *expo-location* (Version 57.0.20) [Computer software]. npm. https://www.npmjs.com/package/expo-location

Expo. (2026e). *expo-splash-screen* (Version 57.0.9) [Computer software]. npm. https://www.npmjs.com/package/expo-splash-screen

Expo. (2026f). *expo-status-bar* (Version 57.0.1) [Computer software]. npm. https://www.npmjs.com/package/expo-status-bar

Expo. (2026g). *@expo/vector-icons* (Version 15.1.1) [Computer software]. npm. https://www.npmjs.com/package/@expo/vector-icons

Google. (n.d.-a). *Authentication REST API*. Firebase. Retrieved September 27, 2026, from https://firebase.google.com/docs/reference/rest/auth

Google. (n.d.-b). *Cloud Firestore*. Firebase. Retrieved September 27, 2026, from https://firebase.google.com/docs/firestore

Google. (n.d.-c). *Firebase Local Emulator Suite*. Firebase. Retrieved September 27, 2026, from https://firebase.google.com/docs/emulator-suite

Google. (n.d.-d). *Get started with Cloud Firestore Security Rules*. Firebase. Retrieved September 27, 2026, from https://firebase.google.com/docs/firestore/security/get-started

Google. (n.d.-e). *Transactions and batched writes*. Firebase. Retrieved September 27, 2026, from https://firebase.google.com/docs/firestore/manage-data/transactions

Google. (n.d.-f). *Use the Cloud Firestore REST API*. Firebase. Retrieved September 27, 2026, from https://firebase.google.com/docs/firestore/use-rest-api

Google. (2026a). *firebase* (Version 12.19.0) [Computer software]. npm. https://www.npmjs.com/package/firebase

Google. (2026b). *firebase-admin* (Version 14.5.0) [Computer software]. npm. https://www.npmjs.com/package/firebase-admin

Google. (2026c). *@firebase/rules-unit-testing* (Version 5.0.2) [Computer software]. npm. https://www.npmjs.com/package/@firebase/rules-unit-testing

Google. (2026d). *firebase-tools* (Version 15.31.0) [Computer software]. npm. https://www.npmjs.com/package/firebase-tools

Meta Platforms. (2025). *react* (Version 19.2.3) [Computer software]. npm. https://www.npmjs.com/package/react

Meta Platforms. (2026). *react-native* (Version 0.86.3) [Computer software]. npm. https://www.npmjs.com/package/react-native

Microsoft. (2026a). *typescript* (Version 6.0.3) [Computer software]. npm. https://www.npmjs.com/package/typescript

Microsoft. (2026b). *typescript* (Version 7.0.2) [Computer software]. npm. https://www.npmjs.com/package/typescript

Poimandres. (2026). *zustand* (Version 5.0.15) [Computer software]. npm. https://www.npmjs.com/package/zustand

Postman. (2026). *newman* (Version 6.2.2) [Computer software]. npm. https://www.npmjs.com/package/newman

React Native Community. (2025). *@react-native-async-storage/async-storage* (Version 2.2.0) [Computer software]. npm. https://www.npmjs.com/package/@react-native-async-storage/async-storage

react-native-maps contributors. (2026). *react-native-maps* (Version 1.27.2) [Computer software]. npm. https://www.npmjs.com/package/react-native-maps

React Navigation contributors. (2026a). *@react-navigation/bottom-tabs* (Version 7.19.2) [Computer software]. npm. https://www.npmjs.com/package/@react-navigation/bottom-tabs

React Navigation contributors. (2026b). *@react-navigation/native* (Version 7.4.1) [Computer software]. npm. https://www.npmjs.com/package/@react-navigation/native

React Navigation contributors. (2026c). *@react-navigation/native-stack* (Version 7.19.2) [Computer software]. npm. https://www.npmjs.com/package/@react-navigation/native-stack

Rojo, F. (2025). *moti* (Version 0.30.0) [Computer software]. npm. https://www.npmjs.com/package/moti

Software Mansion. (2026a). *react-native-reanimated* (Version 4.5.1) [Computer software]. npm. https://www.npmjs.com/package/react-native-reanimated

Software Mansion. (2026b). *react-native-screens* (Version 4.26.2) [Computer software]. npm. https://www.npmjs.com/package/react-native-screens

Software Mansion. (2026c). *react-native-worklets* (Version 0.10.1) [Computer software]. npm. https://www.npmjs.com/package/react-native-worklets
