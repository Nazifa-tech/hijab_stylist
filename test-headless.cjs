// Headless browser simulation: loads all JS files in order into a shared
// global context with a minimal mock DOM, then checks for runtime errors.
// Catches "X is not defined" errors that syntax checking misses.
const vm = require('node:vm');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const errors = [];

// ── Minimal DOM mock ──────────────────────────────────────────────────────
const elements = {};
function makeEl(id) {
  return {
    id,
    style: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} },
    dataset: {},
    innerHTML: '',
    textContent: '',
    src: '',
    width: 200, height: 340,
    getContext() { return makeCtx(); },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return makeEl('q'); },
    querySelectorAll() { return []; },
    matches() { return false; },
    closest() { return null; },
    appendChild() {},
    setAttribute() {},
    getAttribute() { return null; },
    files: [],
  };
}
function makeCtx() {
  return new Proxy({}, { get(t, p) {
    if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ addColorStop(){} });
    if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (p === 'measureText') return () => ({ width: 10 });
    return typeof t[p] === 'function' ? t[p] : (() => {});
  }});
}

const document = {
  getElementById(id) { if (!elements[id]) elements[id] = makeEl(id); return elements[id]; },
  querySelector() { return makeEl('q'); },
  querySelectorAll() { return []; },
  createElement(tag) { return makeEl(tag); },
  addEventListener() {},
  documentElement: { classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} } },
};
const window = {
  matchMedia: () => ({ matches: false, addEventListener(){} }),
  localStorage: (() => { const m = new Map(); return { getItem:k=>m.get(k)||null, setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k), clear:()=>m.clear() }; })(),
  addEventListener() {},
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
};
const URL = { createObjectURL: () => 'blob:mock' };
const console2 = { log(){}, error(){}, warn(){} };

const ctx = {
  document, window, URL, console: console2,
  setTimeout, clearTimeout, setInterval, clearInterval,
  Math, Date, JSON, parseInt, parseFloat, isNaN, Array, Object, String, Number, Boolean, RegExp, Error, Map, Set, Promise, Uint8ClampedArray, HTMLCanvasElement: function(){},
};
vm.createContext(ctx);

function loadFile(rel) {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  try {
    vm.runInContext(code, ctx, { filename: rel });
    console.log('LOADED ' + rel);
  } catch (e) {
    console.log('ERROR in ' + rel + ': ' + e.message);
    errors.push(rel + ': ' + e.message);
  }
}

// Load in the same order as index.html
const files = [
  'js/colour.js', 'js/data.js', 'js/suggest.js', 'js/storage.js',
  'js/colourReader.js', 'js/photoCheck.js', 'js/sprite.js', 'js/app.js',
];
for (const f of files) loadFile(f);

console.log('\n' + (errors.length === 0 ? '✓ ALL FILES LOADED WITHOUT RUNTIME ERRORS' : '✗ ' + errors.length + ' ERROR(S):'));
for (const e of errors) console.log('  ' + e);
process.exit(errors.length === 0 ? 0 : 1);
