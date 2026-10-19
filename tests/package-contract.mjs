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

// The performance mode must be a real opt-out: the bundle has to carry both the
// fast path and the original frame-by-frame path, selected by a stored flag.
assert.match(
  clientSource,
  /dsh:sao-link-start:performance-mode/,
  'The client bundle must ship the performance-mode preference key.',
);
assert.match(
  clientSource,
  /function readPerformanceMode\(\)/,
  'The client bundle must resolve the performance-mode preference on mount.',
);
assert.match(
  clientSource,
  /if \(stored === 'off'\) return false;/,
  'The performance mode must default to the fast path when no preference is stored.',
);
assert.match(
  clientSource,
  /\.sao-root\.is-perf \.sao-tracked-dial\{font-size:15px;transform-origin:0 0/,
  'The fast dial path must scale a fixed box instead of resizing it every frame.',
);
assert.match(
  clientSource,
  /if \(!perfMode\) \{/,
  'The original frame-by-frame path must remain in the bundle for the toggle.',
);

console.log(`package contract ok: ${packageJson.name}@${packageJson.version}`);
