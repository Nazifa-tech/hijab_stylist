// A tiny test helper: no library needed. It runs in a browser page and in Node.

const results = [];

export function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
  }
}

export function assertTrue(condition, message = 'Expected true') {
  if (!condition) throw new Error(message);
}

export function assertEqual(actual, expected, message = 'Values differ') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}: expected ${e}, got ${a}`);
}

export function assertClose(actual, expected, tolerance = 0.001, message = 'Not close enough') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: expected about ${expected}, got ${actual}`);
  }
}

export function assertThrows(fn, message = 'Expected an error to be thrown') {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(message);
}

export function getResults() {
  return results;
}
