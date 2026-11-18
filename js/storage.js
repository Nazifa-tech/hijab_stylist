// storage.js — favourites, rejections, and preferences
//
// All data is kept in localStorage. If localStorage is unavailable (e.g.
// private browsing in some browsers, or a cleared site data), the app still
// works but saving is not possible. Calls to save functions return false
// when storage is unavailable.
//
// Data layout in localStorage:
//   hijab.favourites  — JSON array of { outfitId, hex }
//   hijab.rejections  — JSON array of { outfitId, hex }
//   hijab.preferences — JSON object of key/value pairs

const STORAGE_KEY_FAVOURITES = 'hijab.favourites';
const STORAGE_KEY_REJECTIONS = 'hijab.rejections';
const STORAGE_KEY_PREFERENCES = 'hijab.preferences';

// ── Availability check ───────────────────────────────────────────────────

let storageAvailable = null; // lazily checked

function isAvailable() {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const testKey = 'hijab.test';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

// ── Internal helpers ─────────────────────────────────────────────────────

function getRaw(key) {
  if (!isAvailable()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setRaw(key, value) {
  if (!isAvailable()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getArray(key) {
  const data = getRaw(key);
  return Array.isArray(data) ? data : [];
}

// ── Favourites ───────────────────────────────────────────────────────────

function getFavourites() {
  return getArray(STORAGE_KEY_FAVOURITES);
}

function isFavourite(outfitId, hex) {
  return getFavourites().some((f) => f.outfitId === outfitId && f.hex === hex);
}

function saveFavourite(outfitId, hex) {
  const items = getFavourites();
  // Remove any existing entry for this pairing (prevents duplicates)
  const filtered = items.filter((f) => !(f.outfitId === outfitId && f.hex === hex));
  // Also remove from rejections (mutually exclusive)
  removeRejectionInternal(outfitId, hex);
  filtered.push({ outfitId, hex });
  return setRaw(STORAGE_KEY_FAVOURITES, filtered);
}

function removeFavourite(outfitId, hex) {
  const items = getFavourites();
  const filtered = items.filter((f) => !(f.outfitId === outfitId && f.hex === hex));
  return setRaw(STORAGE_KEY_FAVOURITES, filtered);
}

// ── Rejections ───────────────────────────────────────────────────────────

function removeRejectionInternal(outfitId, hex) {
  const items = getArray(STORAGE_KEY_REJECTIONS);
  const filtered = items.filter((f) => !(f.outfitId === outfitId && f.hex === hex));
  setRaw(STORAGE_KEY_REJECTIONS, filtered);
}

function getRejections() {
  return getArray(STORAGE_KEY_REJECTIONS);
}

function isRejected(outfitId, hex) {
  return getRejections().some((r) => r.outfitId === outfitId && r.hex === hex);
}

function saveRejection(outfitId, hex) {
  const items = getRejections();
  const filtered = items.filter((r) => !(r.outfitId === outfitId && r.hex === hex));
  // Also remove from favourites (mutually exclusive)
  removeFavourite(outfitId, hex);
  filtered.push({ outfitId, hex });
  return setRaw(STORAGE_KEY_REJECTIONS, filtered);
}

function removeRejection(outfitId, hex) {
  const items = getRejections();
  const filtered = items.filter((r) => !(r.outfitId === outfitId && r.hex === hex));
  return setRaw(STORAGE_KEY_REJECTIONS, filtered);
}

function clearAll() {
  if (!isAvailable()) return false;
  try {
    localStorage.removeItem(STORAGE_KEY_FAVOURITES);
    localStorage.removeItem(STORAGE_KEY_REJECTIONS);
    localStorage.removeItem(STORAGE_KEY_PREFERENCES);
    return true;
  } catch {
    return false;
  }
}

// ── Preferences ──────────────────────────────────────────────────────────

function getPreference(key, defaultValue = null) {
  const prefs = getRaw(STORAGE_KEY_PREFERENCES);
  if (prefs && typeof prefs === 'object' && prefs[key] !== undefined) {
    return prefs[key];
  }
  return defaultValue;
}

function savePreference(key, value) {
  let prefs = getRaw(STORAGE_KEY_PREFERENCES);
  if (!prefs || typeof prefs !== 'object') {
    prefs = {};
  }
  prefs[key] = value;
  return setRaw(STORAGE_KEY_PREFERENCES, prefs);
}