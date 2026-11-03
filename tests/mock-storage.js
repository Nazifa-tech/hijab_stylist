// mock-storage.js — in-memory localStorage for Node test runs.
// Imported FIRST in run-node.js so it is in place before storage tests run.

global.localStorage = (() => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
  };
})();
