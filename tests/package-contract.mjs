import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const clientSource = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const registeredId = clientSource.match(/__ModuleLoader__\.load\(\{\s*id:\s*['"]([^'"]+)['"]/s)?.[1];

assert.equal(
  registeredId,
  packageJson.name,
  'The client ModuleLoader id must exactly match package.json name.',
);
assert.notEqual(
  packageJson.dsh?.client?.immediately,
  true,
  'Feature UI plugins must not opt into stage-one immediate prefetch.',
);

console.log(`package contract ok: ${packageJson.name}`);
