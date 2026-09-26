// Runs emulator test files inside `firebase emulators:exec` (see the test:emulator npm script).
// On Windows, emulators:exec exits without stopping the Firestore emulator's Java process, so the next
// run fails with "port taken". Once the tests finish, ask the emulator to shut itself down.
import { spawnSync } from 'node:child_process';
import { resolveEmulatorTarget } from './emulatorGuard.ts';

const target = resolveEmulatorTarget(process.env);
const result = spawnSync(process.execPath, ['--test', ...process.argv.slice(2)], { stdio: 'inherit' });

if (process.platform === 'win32') {
  await fetch(`http://${target.firestoreHost}/shutdown`, { method: 'POST' }).catch(() => undefined);
}
process.exitCode = result.status ?? 1;
