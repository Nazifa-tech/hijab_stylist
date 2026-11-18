// Runs the tests in the terminal: node tests/run-node.js
//
// The app files are plain scripts (no exports) so the same code works on
// file:// in the browser. This runner loads them into the global scope with
// vm.runInThisContext so the test files can call the functions directly.

import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── localStorage mock for the storage tests ──
global.localStorage = (() => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
  };
})();

function loadPlain(rel) {
  let code = fs.readFileSync(path.join(root, rel), 'utf8');
  code = code
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"]\s*;?/g, '')
    .replace(/import\s+['"][^'"]+['"]\s*;?/g, '')
    .replace(/\bexport\s+/g, '');
  vm.runInThisContext(code, { filename: rel });
}

// Load helper + app logic files (functions become globals)
loadPlain('tests/helper.js');
loadPlain('js/colour.js');
loadPlain('js/data.js');
loadPlain('js/suggest.js');
loadPlain('js/storage.js');

// Load the test files (their import lines are stripped)
loadPlain('tests/colour.test.js');
loadPlain('tests/suggest.test.js');
loadPlain('tests/storage.test.js');

const results = getResults();
for (const r of results) {
  console.log(r.ok ? `PASS  ${r.name}` : `FAIL  ${r.name}\n      ${r.error}`);
}
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed} of ${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
