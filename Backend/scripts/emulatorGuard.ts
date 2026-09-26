// Refuses to let admin scripts touch anything but the local emulators.

export const DEFAULT_PROJECT_ID = 'demo-local-events-hub';
const DEFAULT_FIRESTORE_HOST = '127.0.0.1:8080';
const DEFAULT_AUTH_HOST = '127.0.0.1:9099';
const LOCAL_HOSTNAMES = new Set(['127.0.0.1', 'localhost', '[::1]']);

export interface EmulatorTarget {
  projectId: string;
  firestoreHost: string;
  authHost: string;
}

function assertLocal(name: string, host: string): void {
  let hostname: string;
  try {
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    throw new Error(`${name}="${host}" is not a valid host:port.`);
  }
  if (!LOCAL_HOSTNAMES.has(hostname)) {
    throw new Error(`${name}="${host}" is not a local emulator. Refusing to run against a remote host.`);
  }
}

/** Resolves the emulator target from the environment, or throws if anything points at production. */
export function resolveEmulatorTarget(env: Record<string, string | undefined>): EmulatorTarget {
  const projectId = env.GCLOUD_PROJECT ?? DEFAULT_PROJECT_ID;
  if (!projectId.startsWith('demo-')) {
    throw new Error(
      `Project "${projectId}" is not a demo- project. Seeding only runs against demo- projects, which can never reach production.`,
    );
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is set, which loads real credentials. Unset it: the emulator needs none.');
  }

  const firestoreHost = env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_FIRESTORE_HOST;
  const authHost = env.FIREBASE_AUTH_EMULATOR_HOST ?? DEFAULT_AUTH_HOST;
  assertLocal('FIRESTORE_EMULATOR_HOST', firestoreHost);
  assertLocal('FIREBASE_AUTH_EMULATOR_HOST', authHost);

  return { projectId, firestoreHost, authHost };
}
