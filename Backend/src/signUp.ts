// Reference implementation of the client-side signup contract (see README "Signup contract").
// The React Native app should use this function as-is: there is no Cloud Function to create profiles.
import { createUserWithEmailAndPassword, deleteUser, type Auth, type UserCredential } from 'firebase/auth';
import { doc, setDoc, type Firestore } from 'firebase/firestore';
import type { User } from './types.ts';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export async function signUp(auth: Auth, db: Firestore, { name, email, password }: SignUpInput): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  const profile: User = {
    name: name.trim(),
    // The account's own (normalised) email; the rules require it to match the auth token.
    email: credential.user.email ?? email.trim(),
    // Always attendee, never from user input. The rules reject any other value.
    role: 'attendee',
    avatarUrl: '',
  };

  try {
    await setDoc(doc(db, 'users', credential.user.uid), profile);
  } catch (error) {
    // Don't leave an account without a profile: remove it so the user can simply sign up again.
    await deleteUser(credential.user).catch(() => undefined);
    throw error;
  }
  return credential;
}
