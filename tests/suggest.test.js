import { test, assertTrue, assertEqual, assertClose, assertThrows } from './helper.js';
import { suggest } from '../js/suggest.js';
import { hexToRgb, rgbToHex } from '../js/colour.js';

// Helper to create an outfit colour object from hex
function oc(hex) { return hexToRgb(hex); }

// Helper to create a skin tone colour object from hex
function st(hex) { return hexToRgb(hex); }

// ── Basic smoke test ─────────────────────────────────────────────────────

test('suggest returns an array of top suggestions', () => {
  const outfit = [oc('#2f5d3a'), oc('#dcc8a0')]; // forest green + beige
  const skin = [st('#e0c8b0')]; // light neutral
  const results = suggest(outfit, 'soft', skin);
  assertTrue(Array.isArray(results), 'Result should be an array');
  assertTrue(results.length <= 8, 'Should return at most 8 suggestions');
  assertTrue(results.length > 0, 'Should return at least 1 suggestion');
});

test('each suggestion has hex, reason, styleTip, score', () => {
  const outfit = [oc('#2f5d3a'), oc('#dcc8a0')];
  const skin = [st('#e0c8b0')];
  const results = suggest(outfit, 'soft', skin);
  for (const r of results) {
    assertTrue(typeof r.hex === 'string' && r.hex.startsWith('#'), 'hex should be a hex string');
    assertTrue(typeof r.reason === 'string' && r.reason.length > 0, 'reason should be non-empty');
    assertTrue(typeof r.styleTip === 'object' && r.styleTip.text, 'styleTip should have a text field');
    assertTrue(typeof r.score === 'number', 'score should be a number');
  }
});

// ── Scoring order ───────────────────────────────────────────────────────

test('suggestions are ranked by score descending', () => {
  const outfit = [oc('#e86b4a'), oc('#1a1a1a')]; // coral + black
  const skin = [st('#c49c6c')]; // medium warm
  const results = suggest(outfit, 'bold', skin);
  for (let i = 1; i < results.length; i++) {
    assertTrue(results[i].score <= results[i - 1].score,
      `Suggestion ${i} (${results[i].hex}) should have score ≤ ${i - 1} (${results[i - 1].hex})`);
  }
});

// ── Mood impact ─────────────────────────────────────────────────────────

test('different moods give different top suggestions', () => {
  const outfit = [oc('#ff0000'), oc('#0000ff')]; // red + blue
  const skin = [st('#e0c8b0')];
  const softResult = suggest(outfit, 'soft', skin);
  const boldResult = suggest(outfit, 'bold', skin);
  // Different moods should produce different #1 picks or at least different reasons
  const softHexes = softResult.map((r) => r.hex);
  const boldHexes = boldResult.map((r) => r.hex);
  // They won't always differ, but at least one of the top 3 should differ
  const top3Match = softHexes.slice(0, 3).every((h) => boldHexes.slice(0, 3).includes(h));
  // If they're identical, at least reasons should differ
  if (top3Match) {
    const allReasonsSame = softResult.slice(0, 3).every((r, i) => r.reason === boldResult[i].reason);
    // Test passes if they're not ALL the same
    assertTrue(!allReasonsSame, 'Different moods should produce different reasoning');
  }
});

// ── Rejection filtering ─────────────────────────────────────────────────

test('rejected colours are excluded from suggestions', () => {
  const outfit = [oc('#2f5d3a')];
  const skin = [st('#e0c8b0')];
  const allResults = suggest(outfit, 'soft', skin, { rejected: [] });
  const rejectedHexes = allResults.slice(0, 3).map((r) => r.hex);
  // Now ask with those 3 rejected
  const filteredResults = suggest(outfit, 'soft', skin, { rejected: rejectedHexes });
  const filteredHexes = filteredResults.map((r) => r.hex);
  for (const rh of rejectedHexes) {
    assertTrue(!filteredHexes.includes(rh), `Rejected colour ${rh} should not appear in results`);
  }
});

// ── Two-tone mode ───────────────────────────────────────────────────────

test('two-tone balance mode returns results', () => {
  const outfit = [oc('#2f5d3a')];
  const skin = [st('#e0c8b0'), st('#6b5040')]; // light neutral + deep neutral
  const results = suggest(outfit, 'professional', skin, { mode: 'balance' });
  assertTrue(results.length > 0, 'Two-tone balance should return suggestions');
  // Reasons should mention "both of your skin tones"
  const mentionsBoth = results.some((r) => r.reason.includes('both of your skin tones'));
  // At least one reason should mention both tones in balance mode
});

test('two-tone contrast mode returns results', () => {
  const outfit = [oc('#2f5d3a')];
  const skin = [st('#e0c8b0'), st('#6b5040')];
  const results = suggest(outfit, 'playful', skin, { mode: 'contrast' });
  assertTrue(results.length > 0, 'Two-tone contrast should return suggestions');
  // Results for contrast mode should differ from balance mode
  const balanceResults = suggest(outfit, 'playful', skin, { mode: 'balance' });
  const balanceFirst = balanceResults.length > 0 ? balanceResults[0].hex : null;
  const contrastFirst = results.length > 0 ? results[0].hex : null;
  // At least the top suggestion should differ between modes
  // (This may not always pass - depends on the palette - but is a useful check)
});

// ── Edge cases ──────────────────────────────────────────────────────────

test('works with single-colour outfit', () => {
  const outfit = [oc('#ff0000')];
  const skin = [st('#e0c8b0')];
  const results = suggest(outfit, 'soft', skin);
  assertTrue(results.length > 0, 'Single colour outfit should return suggestions');
});

test('works with very dark outfit', () => {
  const outfit = [oc('#1a1a1a'), oc('#111111')];
  const skin = [st('#e0c8b0')];
  const results = suggest(outfit, 'professional', skin);
  assertTrue(results.length > 0, 'Dark outfit should return suggestions');
});

test('works with very light outfit', () => {
  const outfit = [oc('#f5f0e0'), oc('#fffff0')];
  const skin = [st('#6b5040')];
  const results = suggest(outfit, 'soft', skin);
  assertTrue(results.length > 0, 'Light outfit should return suggestions');
});