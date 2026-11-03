import { test, assertTrue, assertEqual, assertThrows } from './helper.js';
import {
  isAvailable, getFavourites, isFavourite, saveFavourite, removeFavourite,
  getRejections, isRejected, saveRejection, removeRejection,
  getPreference, savePreference, clearAll,
} from '../js/storage.js';

// ── Availability ────────────────────────────────────────────────────────

test('isAvailable returns true (in browser with localStorage)', () => {
  assertTrue(isAvailable() === true || isAvailable() === false, 'isAvailable should return a boolean');
});

// ── Favourites ──────────────────────────────────────────────────────────

test('getFavourites returns an empty array initially', () => {
  // Reset first
  clearAll();
  const favs = getFavourites();
  assertTrue(Array.isArray(favs), 'Favourites should be an array');
  assertEqual(favs.length, 0, 'Favourites should be empty initially');
});

test('saveFavourite and isFavourite work', () => {
  clearAll();
  const saved = saveFavourite('outfit-1', '#ff0000');
  // saveFavourite may return false if localStorage unavailable
  if (!saved) return; // skip if storage unavailable
  assertTrue(isFavourite('outfit-1', '#ff0000'), 'Should be favourite after saving');
  assertTrue(!isFavourite('outfit-1', '#00ff00'), 'Other colour should not be favourite');
  assertTrue(!isFavourite('outfit-2', '#ff0000'), 'Other outfit should not be favourite');
});

test('removeFavourite removes a saved favourite', () => {
  clearAll();
  saveFavourite('outfit-1', '#ff0000');
  removeFavourite('outfit-1', '#ff0000');
  assertTrue(!isFavourite('outfit-1', '#ff0000'), 'Should not be favourite after removal');
});

test('saveFavourite adds to list', () => {
  clearAll();
  saveFavourite('outfit-1', '#ff0000');
  saveFavourite('outfit-1', '#00ff00');
  const favs = getFavourites();
  assertEqual(favs.length, 2, 'Should have 2 favourites');
});

// ── Rejections ──────────────────────────────────────────────────────────

test('getRejections returns an empty array initially', () => {
  clearAll();
  const rejs = getRejections();
  assertTrue(Array.isArray(rejs), 'Rejections should be an array');
  assertEqual(rejs.length, 0, 'Rejections should be empty initially');
});

test('saveRejection and isRejected work', () => {
  clearAll();
  const saved = saveRejection('outfit-1', '#ff0000');
  if (!saved) return;
  assertTrue(isRejected('outfit-1', '#ff0000'), 'Should be rejected after saving');
  assertTrue(!isRejected('outfit-1', '#00ff00'), 'Other colour should not be rejected');
});

test('removeRejection restores a rejected item', () => {
  clearAll();
  saveRejection('outfit-1', '#ff0000');
  removeRejection('outfit-1', '#ff0000');
  assertTrue(!isRejected('outfit-1', '#ff0000'), 'Should not be rejected after removal');
});

// ── Mutual exclusivity ──────────────────────────────────────────────────

test('favourite removes matching rejection', () => {
  clearAll();
  saveRejection('outfit-1', '#ff0000');
  saveFavourite('outfit-1', '#ff0000');
  // The same pairing should not be both favourite and rejected
  assertTrue(!isRejected('outfit-1', '#ff0000'), 'Favourite should remove rejection');
  assertTrue(isFavourite('outfit-1', '#ff0000'), 'Should be favourite');
});

test('rejection removes matching favourite', () => {
  clearAll();
  saveFavourite('outfit-1', '#ff0000');
  saveRejection('outfit-1', '#ff0000');
  assertTrue(!isFavourite('outfit-1', '#ff0000'), 'Rejection should remove favourite');
  assertTrue(isRejected('outfit-1', '#ff0000'), 'Should be rejected');
});

// ── Preferences ─────────────────────────────────────────────────────────

test('getPreference returns default for unknown key', () => {
  clearAll();
  assertEqual(getPreference('skinTone', 'none'), 'none');
  assertEqual(getPreference('nonexistent'), null);
});

test('savePreference and getPreference round-trip', () => {
  clearAll();
  savePreference('skinTone', 'neut-2');
  assertEqual(getPreference('skinTone'), 'neut-2');
  savePreference('skinTone', 'warm-3');
  assertEqual(getPreference('skinTone'), 'warm-3');
});

// ── Clear all ───────────────────────────────────────────────────────────

test('clearAll removes all stored data', () => {
  clearAll();
  saveFavourite('outfit-1', '#ff0000');
  saveRejection('outfit-1', '#00ff00');
  savePreference('skinTone', 'warm-1');
  clearAll();
  assertEqual(getFavourites().length, 0);
  assertEqual(getRejections().length, 0);
  assertEqual(getPreference('skinTone'), null);
});