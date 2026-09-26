import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_PROJECT_ID, resolveEmulatorTarget } from '../scripts/emulatorGuard.ts';

test('defaults to the local emulators and the demo project', () => {
  assert.deepEqual(resolveEmulatorTarget({}), {
    projectId: DEFAULT_PROJECT_ID,
    firestoreHost: '127.0.0.1:8080',
    authHost: '127.0.0.1:9099',
  });
});

test('accepts localhost and IPv6 loopback emulator hosts', () => {
  const target = resolveEmulatorTarget({
    FIRESTORE_EMULATOR_HOST: 'localhost:8081',
    FIREBASE_AUTH_EMULATOR_HOST: '[::1]:9100',
  });
  assert.equal(target.firestoreHost, 'localhost:8081');
  assert.equal(target.authHost, '[::1]:9100');
});

test('refuses a project that is not a demo- project', () => {
  assert.throws(() => resolveEmulatorTarget({ GCLOUD_PROJECT: 'local-events-hub' }), /not a demo- project/);
});

test('refuses when real credentials are configured', () => {
  assert.throws(
    () => resolveEmulatorTarget({ GOOGLE_APPLICATION_CREDENTIALS: 'serviceAccountKey.json' }),
    /GOOGLE_APPLICATION_CREDENTIALS/,
  );
});

test('refuses emulator hosts that are not on this machine', () => {
  assert.throws(() => resolveEmulatorTarget({ FIRESTORE_EMULATOR_HOST: 'firestore.googleapis.com:443' }), /not a local emulator/);
  assert.throws(() => resolveEmulatorTarget({ FIREBASE_AUTH_EMULATOR_HOST: '10.0.0.5:9099' }), /not a local emulator/);
  // A lookalike that merely starts with a local name must not pass.
  assert.throws(() => resolveEmulatorTarget({ FIRESTORE_EMULATOR_HOST: 'localhost.evil.com:8080' }), /not a local emulator/);
});
