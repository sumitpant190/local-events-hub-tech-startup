# Local Events Hub

A mobile app for discovering local events. University group project, theme: **Tech & Startup**.

- `Frontend/` — React Native app (Expo managed workflow, TypeScript)
- `Backend/` — Firebase on the free Spark plan: Firestore security rules, emulator config, seed scripts, rules tests, Postman collection
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
| `npm run test:emulator` | Start throwaway emulators, run the emulator tests (signup, security rules, RSVP and comment races), stop them |
| `npm run typecheck` | TypeScript check |

### Link the real Firebase project (Spark plan)

1. In the [Firebase Console](https://console.firebase.google.com), create a project. It starts on Spark. Don't upgrade it or add billing.
2. **Build → Firestore Database → Create database**, and choose **production mode** (deny all), not test mode.
3. **Build → Authentication → Sign-in method**, and enable **Email/Password**.
4. Link it locally: `npm run firebase -- login`, then `npm run firebase -- use --add` and pick the project.
5. Deploy the rules and indexes: `npm run firebase -- deploy --only firestore:rules,firestore:indexes --project events-hub-techstartup`. Until you do, the database keeps the Console's deny-all default. Re-run it whenever `firestore.rules` changes.

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

### Access rules (what `firestore.rules` allows)

Everything is denied unless listed here. Roles come from `users/{uid}.role`, read live by the rules; there are no custom claims on Spark.

| Path | Read | Create | Update | Delete |
|---|---|---|---|---|
| `users/{uid}` | signed in | own uid only, `role: "attendee"`, own login email | own `name`/`avatarUrl` only (never `role` or `email`); admins may also change `role` | nobody |
| `events/{id}` | signed in | organizer/admin; `organizerId` = self (admins: anyone); counters start at 0 | owner organizer or admin; can't change `organizerId` (admins can) or the counters. **Plus** any signed-in user may change `attendeeCount` alone, by exactly the ±1 their own RSVP makes in the same commit, or `commentCount` alone, by ±1 | owner organizer or admin |
| `events/{id}/rsvps/{uid}` | signed in | own uid only; `status` `going`/`not_going`; `updatedAt: serverTimestamp()`; committed together with the matching `attendeeCount` change | same as create | nobody (cancel = `not_going`) |
| `events/{id}/comments/{cid}` | signed in | `userId` = self; non-blank `text` under 500 characters; `createdAt: serverTimestamp()`; committed together with `commentCount` +1 | nobody (comments are immutable) | author or admin, committed together with `commentCount` −1 |

The frontend must follow these:
- **Timestamps:** write `updatedAt` and `createdAt` with `serverTimestamp()`. Client clock values are rejected.
- **Cancelling an RSVP:** set `status: "not_going"`; don't delete the doc.
- **Document shapes:** send exactly the schema fields. Extra fields are rejected.

`npm run test:emulator` covers every row, allowed and denied.

### RSVP (client-side transaction)

Use the reference implementation in `Backend/src/services/rsvpService.ts`:

```ts
import { toggleRsvp } from './rsvpService';

const { status, attendeeCount } = await toggleRsvp(db, eventId, auth.currentUser!.uid);
```

Inside one `runTransaction`, it:
1. reads the event and the caller's `rsvps/{uid}`;
2. flips `going` ↔ `not_going` (a missing RSVP counts as not going);
3. writes the RSVP (`updatedAt: serverTimestamp()`) and `attendeeCount: increment(±1)` atomically.

**Why a transaction, even without a server:** every phone writes to the same `attendeeCount` field. With a naive read-then-write, two people who tap RSVP at the same moment both read `12`, both write `13`, and one RSVP disappears from the count forever. Nothing on a server can serialise them for us.
- **What the transaction does:** it makes Firestore check at commit time that nothing it read has changed. If another RSVP got in first, it retries on fresh data.
- **Why the RSVP and counter go in one commit:** a crash or lost connection between the two writes can't leave the RSVP saved but the count unchanged.
- **Why `increment()`:** it's applied by the server to the value it holds at commit, so a count computed from a read that has since gone out of date is never written.
- **What the rules add:** the counter may only move by exactly the ±1 your own RSVP makes in the same commit, checked against the stored value. A buggy or tampered client that writes `count + 1` from a stale read, or bumps the count without RSVPing, gets `permission-denied` instead of corrupting the number.

In the UI, disable the RSVP button while a toggle is in flight, and show the error if one is thrown (e.g. `permission-denied` if the same account toggled from two devices at the same instant; tapping again works).

### Comments (real-time, no server)

**Reading is Firestore's own listener.** There is nothing to build for "real-time": subscribe to the subcollection and Firestore pushes every new or deleted comment to all open screens.

```ts
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';

useEffect(() => {
  const q = query(collection(db, 'events', eventId, 'comments'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    // serverTimestamps: 'estimate' fills createdAt for your own just-posted comment until the server confirms it.
    setComments(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })));
  }, (error) => setError(error.message));
}, [eventId]); // returning onSnapshot's unsubscribe stops the listener on unmount
```

**Writing goes through `Backend/src/services/commentService.ts`.** There is no Cloud Function trigger on Spark to keep `commentCount` up to date, so the count is maintained by the same client-side transaction technique as RSVPs:

```ts
import { addComment, deleteComment } from './commentService';

const commentId = await addComment(db, eventId, auth.currentUser!.uid, text);
await deleteComment(db, eventId, commentId); // author or admin
```

- **`addComment`** runs one `runTransaction`. It checks the event still exists, creates the comment (`createdAt: serverTimestamp()`) and applies `commentCount: increment(1)` in the same commit.
- **`deleteComment`** reads the comment first, then deletes it and applies `increment(-1)`. A double tap or a second device finds the comment already gone and can't decrement twice.
- **What the rules enforce:** a comment can't be created or deleted unless `commentCount` moves by exactly +1/−1 in the same commit. The count can therefore never drift from the real number of comments through the app.
- **Known limit:** comment ids are random, so the rules can't tell whether a lone `commentCount` ±1 write comes with a comment. A tampered client could nudge the count by 1 per write (never below 0) without commenting. Closing that needs a server-side trigger (Blaze) or deterministic comment ids. It's accepted here because the count is display-only.

### Promoting a user to organizer or admin

Everyone signs up as `attendee`. The Spark plan has no admin Cloud Function, so for testing and demos, promote a user by hand:

- **Real project:** open the [Firebase Console](https://console.firebase.google.com) → **Firestore Database**, open `users/{userId}`, change the `role` field to `organizer` or `admin`, and save.
- **Emulators:** do the same in the Emulator UI at http://127.0.0.1:4000/firestore.

Console and Emulator UI edits go through the Admin API, so they aren't blocked by the rules that stop users from changing their own role. The user's app picks up the new role the next time it reads their profile.

## API Documentation

**There is no custom server.** The "API" is Firestore's own REST interface, which every Firestore database exposes over HTTPS automatically. The app uses the Firebase SDK, which talks to the same service. Every REST request is checked by the same `firestore.rules` as the app's requests, so the rules are the API's access control. There are no endpoints to deploy or host; they exist as soon as the database does.

| | Production | Local emulators |
|---|---|---|
| Firestore base URL | `https://firestore.googleapis.com/v1` | `http://127.0.0.1:8080/v1` |
| Auth base URL | `https://identitytoolkit.googleapis.com/v1` | `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1` |
| Project id | your Firebase project id | `demo-local-events-hub` |

A document path is `{base}/projects/{PROJECT_ID}/databases/(default)/documents/{path}`, authenticated with the header `Authorization: Bearer <Firebase ID token>`.

### Postman collection

`Backend/postman_collection.json` (Postman collection v2.1) holds every request below, with test assertions. It targets the emulators by default. To use it:

1. Start the emulators and seed them (`npm run emulators`, then `npm run seed:emulator`).
2. Either import the file into Postman (**Import → File**) and run the collection in order, or run it from `Backend/` with the Postman CLI:

   ```bash
   npx -y newman@6 run postman_collection.json
   ```

   Expected result: 9 requests, 14 assertions, 0 failed.

**Against the real project**, override the variables on the command line (or edit them in Postman). The committed file keeps pointing at the emulators.

```powershell
npx -y newman@6 run postman_collection.json `
  --env-var "firestoreBase=https://firestore.googleapis.com/v1" `
  --env-var "authBase=https://identitytoolkit.googleapis.com/v1" `
  --env-var "projectId=events-hub-techstartup" `
  --env-var "apiKey=<Web API key>" `
  --env-var "email=<an attendee account>" --env-var "password=<its password>" `
  --env-var "eventId=<an existing event id>" --env-var "otherUserId=<another user's uid>"
```

The signed-in account must be an `attendee` (the tests check that its role stays `attendee`), and `otherUserId` must be a different user. Verified on `events-hub-techstartup` (2026-09-27): 9 requests, 14 assertions, 0 failed.

### Getting an ID token

The collection's first request does this for you and stores `idToken` and `uid` for the other requests. By hand, either:

- **Firebase Auth REST `signInWithPassword`** (the ID token lasts 1 hour):

  ```http
  POST {authBase}/accounts:signInWithPassword?key={WEB_API_KEY}
  Content-Type: application/json

  { "email": "priya@student.uni.edu", "password": "startup123", "returnSecureToken": true }
  ```

  ```json
  { "localId": "usr-05", "email": "priya@student.uni.edu", "idToken": "eyJhbGciOi…", "refreshToken": "…", "expiresIn": "3600" }
  ```

  The Web API key is in **Project Settings → General** (it's not a secret; see "Secrets" above). The Auth emulator accepts any key, e.g. `fake-api-key`. The seeded accounts exist only in the emulators.

- **Copy one from the app during development:** after signing in, log `await auth.currentUser?.getIdToken()` and paste it into the `idToken` variable. Remove the log before committing.

### Endpoints

Responses use Firestore's typed JSON (`stringValue`, `integerValue`, `timestampValue`…). The examples are real emulator output from the seeded data, shortened with `…`.

#### GET a single event: `GET {base}/projects/{PROJECT_ID}/databases/(default)/documents/events/{eventId}`

Allowed for any signed-in user.

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

#### List events: `GET {base}/projects/{PROJECT_ID}/databases/(default)/documents/events?pageSize=5`

Allowed for any signed-in user. It returns up to `pageSize` documents; pass the response's `nextPageToken` as `pageToken` to get the next page.

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

#### GET my own user document: `GET {base}/projects/{PROJECT_ID}/databases/(default)/documents/users/{uid}`

`{uid}` is the `localId` returned at sign-in.

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

### Rejected requests (the rules at work)

These are in the collection's **2. Rejected by security rules** folder. They show that the database refuses requests the rules don't allow, even though anyone can reach the URL.

| Request | Why it's refused | Emulator | Production |
|---|---|---|---|
| `GET …/events/evt-01` with **no** `Authorization` header | every read requires `request.auth != null` | `403 PERMISSION_DENIED` | `403 PERMISSION_DENIED` |
| `GET …/events/evt-01` with `Bearer not-a-real-token` | the token isn't a valid Firebase ID token | `400 INVALID_ARGUMENT` ("invalid jwt") | `401 UNAUTHENTICATED` |
| `PATCH …/users/usr-01?updateMask.fieldPaths=name` as Priya (`usr-05`) | wrong-user write: users may only update their own profile | `403 PERMISSION_DENIED` | `403 PERMISSION_DENIED` |
| `PATCH …/users/usr-05?updateMask.fieldPaths=role` with `"admin"` as Priya | self-promotion: users can never change their own `role` | `403 PERMISSION_DENIED` | `403 PERMISSION_DENIED` |

A follow-up `GET` of `users/usr-05` confirms `role` is still `attendee`. Example wrong-user write:

```http
PATCH /v1/projects/demo-local-events-hub/databases/(default)/documents/users/usr-01?updateMask.fieldPaths=name
Authorization: Bearer {idToken of usr-05}
Content-Type: application/json

{ "fields": { "name": { "stringValue": "Hacked" } } }
```

```json
{ "error": { "code": 403, "message": "\nfalse for 'create' @ L81, … false for 'update' @ L88, …", "status": "PERMISSION_DENIED" } }
```

That `message` is the emulator's rule trace, which helps with debugging. Production returns the generic message instead, with the same `status`, so no rule details leak:

```json
{ "error": { "code": 403, "message": "Missing or insufficient permissions.", "status": "PERMISSION_DENIED" } }
```

Both columns of the table above were verified by running the collection on the emulators and on `events-hub-techstartup`. On production an attendee creating an event was also refused (403), and an organizer creating one was allowed (200).

The full allowed/denied matrix (82 cases, SDK-based) is in `Backend/tests/` (`npm run test:emulator`).

## References

Axios contributors. (2026). *axios* (Version 1.20.0) [Computer software]. npm. https://www.npmjs.com/package/axios

Expo. (2026). *expo* (Version 57.0.25) [Computer software]. npm. https://www.npmjs.com/package/expo

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

Microsoft. (2026). *typescript* (Version 7.0.2) [Computer software]. npm. https://www.npmjs.com/package/typescript

Poimandres. (2026). *zustand* (Version 5.0.15) [Computer software]. npm. https://www.npmjs.com/package/zustand

Postman. (2026). *newman* (Version 6.2.2) [Computer software]. npm. https://www.npmjs.com/package/newman

React Native Community. (2025). *@react-native-async-storage/async-storage* (Version 2.2.0) [Computer software]. npm. https://www.npmjs.com/package/@react-native-async-storage/async-storage

react-native-maps contributors. (2026). *react-native-maps* (Version 1.27.2) [Computer software]. npm. https://www.npmjs.com/package/react-native-maps

React Navigation contributors. (2026). *@react-navigation/native* (Version 7.4.1) [Computer software]. npm. https://www.npmjs.com/package/@react-navigation/native

Rojo, F. (2025). *moti* (Version 0.30.0) [Computer software]. npm. https://www.npmjs.com/package/moti

Software Mansion. (2026). *react-native-reanimated* (Version 4.5.1) [Computer software]. npm. https://www.npmjs.com/package/react-native-reanimated
