// Seeds the LOCAL Firebase emulators with sample users, events, RSVPs and comments.
// Never runs against production: see emulatorGuard.ts. Usage: npm run emulators, then npm run seed:emulator.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Comment, Event, Rsvp, User } from '../src/types.ts';
import { resolveEmulatorTarget, type EmulatorTarget } from './emulatorGuard.ts';
import { DEMO_PASSWORD, RSVP_UPDATED_AT, seedEvents, seedUsers } from './seedData.ts';

const avatarUrl = (name: string) => `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(name)}`;
const imageUrl = (eventId: string) => `https://picsum.photos/seed/${eventId}/800/450`;
const toTimestamp = (iso: string) => Timestamp.fromDate(new Date(iso));

/**
 * Wipes existing emulator data so the seed is repeatable. These endpoints exist only on the emulators,
 * so this also fails loudly if the hosts are not actually emulators.
 */
async function clearEmulators({ projectId, firestoreHost, authHost }: EmulatorTarget): Promise<void> {
  const endpoints = [
    `http://${firestoreHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    `http://${authHost}/emulator/v1/projects/${projectId}/accounts`,
  ];
  for (const url of endpoints) {
    let response: Response;
    try {
      response = await fetch(url, { method: 'DELETE' });
    } catch {
      throw new Error(`Can't reach the emulator at ${new URL(url).host}. Start it first with "npm run emulators".`);
    }
    if (!response.ok) throw new Error(`Clearing ${url} failed with HTTP ${response.status}.`);
  }
}

async function seed(): Promise<void> {
  const target = resolveEmulatorTarget(process.env);
  // Pin the Admin SDK to the emulators before any client is created.
  process.env.FIRESTORE_EMULATOR_HOST = target.firestoreHost;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = target.authHost;

  await clearEmulators(target);

  const app = initializeApp({ projectId: target.projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const user of seedUsers) {
    await auth.createUser({ uid: user.id, email: user.email, password: DEMO_PASSWORD, displayName: user.name });
  }

  const batch = db.batch();
  let rsvpCount = 0;
  let commentCount = 0;

  for (const user of seedUsers) {
    const doc: User = { name: user.name, email: user.email, role: user.role, avatarUrl: avatarUrl(user.name) };
    batch.set(db.doc(`users/${user.id}`), doc);
  }

  for (const event of seedEvents) {
    const rsvps = Object.entries(event.rsvps);
    const doc: Event = {
      title: event.title,
      description: event.description,
      date: toTimestamp(event.date),
      location: event.location,
      category: event.category,
      organizerId: event.organizerId,
      // Counters must equal the subcollections they summarise; later rules enforce +/-1 updates from here.
      attendeeCount: rsvps.filter(([, status]) => status === 'going').length,
      commentCount: event.comments.length,
      imageUrl: imageUrl(event.id),
    };
    const eventRef = db.doc(`events/${event.id}`);
    batch.set(eventRef, doc);

    for (const [userId, status] of rsvps) {
      const rsvp: Rsvp = { status, updatedAt: toTimestamp(RSVP_UPDATED_AT) };
      batch.set(eventRef.collection('rsvps').doc(userId), rsvp);
      rsvpCount += 1;
    }
    for (const comment of event.comments) {
      const body: Comment = { userId: comment.userId, text: comment.text, createdAt: toTimestamp(comment.createdAt) };
      batch.set(eventRef.collection('comments').doc(comment.id), body);
      commentCount += 1;
    }
  }

  await batch.commit();
  console.log(
    `Seeded ${target.projectId} at ${target.firestoreHost}: ${seedUsers.length} users (auth + firestore), ` +
      `${seedEvents.length} events, ${rsvpCount} RSVPs, ${commentCount} comments. Demo password: ${DEMO_PASSWORD}`,
  );
}

seed().catch((error: unknown) => {
  console.error(`Seed aborted: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
