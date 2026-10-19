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

// Compatibility mode must stay a real opt-in: the bundle carries both the
// original frame-by-frame path (the default) and the compositor-friendly
// fallback, selected by a stored flag.
assert.match(
  clientSource,
  /dsh:sao-link-start:compatibility-mode/,
  'The client bundle must ship the compatibility-mode preference key.',
);
assert.match(
  clientSource,
  /function readCompatibilityMode\(\)/,
  'The client bundle must resolve the compatibility-mode preference on mount.',
);
assert.match(
  clientSource,
  /if \(stored === 'on'\) return true;/,
  'The compatibility mode must be opt-in: no stored preference means the original path.',
);
assert.match(
  clientSource,
  /if \(stored === 'off'\) return false;[\s\S]{0,200}?return false;/,
  'The compatibility mode must default to the original rendering path.',
);
assert.match(
  clientSource,
  /\.sao-root\.is-compat \.sao-tracked-dial\{font-size:15px;transform-origin:0 0/,
  'The compatibility dial path must scale a fixed box instead of resizing it every frame.',
);
assert.match(
  clientSource,
  /if \(!compatMode\) \{/,
  'The original frame-by-frame path must remain in the bundle for the toggle.',
);

// Tunnel only must be an independent opt-in that renders just the beam tunnel.
assert.match(
  clientSource,
  /dsh:sao-link-start:tunnel-only/,
  'The client bundle must ship the tunnel-only preference key.',
);
assert.match(
  clientSource,
  /function readTunnelOnly\(\)/,
  'The client bundle must resolve the tunnel-only preference on mount.',
);
assert.match(
  clientSource,
  /const \[tunnelOnly\] = useState\(readTunnelOnly\);/,
  'The tunnel-only flag must be read on every overlay mount.',
);
assert.match(
  clientSource,
  /const T_TUNNEL_LEAVE = 3700;/,
  'Tunnel-only mode must fade the overlay out around 3.7s.',
);
assert.match(
  clientSource,
  /!tunnelOnly && !reduced && h\(DialSequence/,
  'Tunnel-only mode must skip the five-sense dial sequence.',
);
assert.match(
  clientSource,
  /!tunnelOnly && h\('div', \{ className: 'sao-login' \},/,
  'Tunnel-only mode must skip the login panel.',
);
assert.match(
  clientSource,
  /!tunnelOnly && h\('div', \{ className: 'sao-reg' \},/,
  'Tunnel-only mode must skip the character registration dialog.',
);

console.log(`package contract ok: ${packageJson.name}@${packageJson.version}`);
