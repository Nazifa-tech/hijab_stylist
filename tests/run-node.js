// Runs the same tests in the terminal: node tests/run-node.js
import './mock-storage.js';
import { getResults } from './helper.js';
import './colour.test.js';
import './suggest.test.js';
import './storage.test.js';

const results = getResults();
for (const r of results) {
  console.log(r.ok ? `PASS  ${r.name}` : `FAIL  ${r.name}\n      ${r.error}`);
}
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed} of ${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
