// suggest.js — the suggestion engine
//
// Takes outfit colours, a mood, and skin tone(s) and returns a ranked list
// of hijab colour suggestions, each with a reason and a style tip.
//
// The engine knows nothing about photos or screens. Its rules are based on
// colour theory (complementary, analogous, neutral anchors) adjusted by mood.
// The same input always gives the same output.

import { hexToRgb, rgbToHsl, hueDifference, relativeLuminance } from './colour.js';
import { styleTips } from './data.js';

// ── Base hijab colour palette ────────────────────────────────────────────

const HIJAB_PALETTE = [
  { name: 'Cream',       hex: '#f5f0e0' },
  { name: 'Ivory',       hex: '#fffff0' },
  { name: 'Black',       hex: '#1a1a1a' },
  { name: 'Navy',        hex: '#1a2a4a' },
  { name: 'Charcoal',    hex: '#4a4a4a' },
  { name: 'Dusty rose',  hex: '#c4a0a0' },
  { name: 'Blush',       hex: '#e8b8b8' },
  { name: 'Terracotta',  hex: '#c46b4a' },
  { name: 'Camel',       hex: '#c49c6b' },
  { name: 'Beige',       hex: '#dcc8a0' },
  { name: 'Forest green',hex: '#2f5d3a' },
  { name: 'Sage',        hex: '#7a9c6b' },
  { name: 'Olive',       hex: '#6b7a3a' },
  { name: 'Dusty blue',  hex: '#6b7a9c' },
  { name: 'Steel blue',  hex: '#4a6b8c' },
  { name: 'Sky blue',    hex: '#8cb4d8' },
  { name: 'Burgundy',    hex: '#5a1a2a' },
  { name: 'Plum',        hex: '#4a2a5a' },
  { name: 'Lavender',    hex: '#c4a0d8' },
  { name: 'Mustard',     hex: '#d4b43a' },
  { name: 'Rust',        hex: '#8c4a1a' },
  { name: 'Teal',        hex: '#2a6b6b' },
  { name: 'Coral',       hex: '#e86b4a' },
  { name: 'Mint',        hex: '#a0d4b4' },
  { name: 'Dusty pink',  hex: '#d4a4a4' },
  { name: 'Chocolate',   hex: '#3a2a1a' },
  { name: 'Slate',       hex: '#4a5a6b' },
  { name: 'Wine',        hex: '#6a1a2a' },
  { name: 'Biscuit',     hex: '#e0d0b0' },
  { name: 'Pewter',      hex: '#6b6b6b' },
  { name: 'Mulberry',    hex: '#3a1a4a' },
  { name: 'Cinnamon',    hex: '#8c4a2a' },
];
// ── Mood weights ──────────────────────────────────────────────────────────

const MOOD_WEIGHTS = {
  soft:         { complement: 0.2, analogous: 0.4, neutral: 0.3, vibrance: 0.1, lightness: 0.3 },
  bold:         { complement: 0.5, analogous: 0.1, neutral: 0.1, vibrance: 0.5, lightness: 0.1 },
  professional: { complement: 0.1, analogous: 0.2, neutral: 0.5, vibrance: 0.1, lightness: 0.3 },
  playful:      { complement: 0.3, analogous: 0.3, neutral: 0.1, vibrance: 0.4, lightness: 0.2 },
};

// ── Hex-to-name lookup ──────────────────────────────────────────────────

export function colourName(hex) {
  const c = HIJAB_PALETTE.find((h) => h.hex === hex);
  return c ? c.name : hex;
}

// ── Main suggestion function ─────────────────────────────────────────────

export function suggest(outfitColours, mood, skinTones, opts = {}) {
  const { mode = 'balance', rejected = [] } = opts;
  const weights = MOOD_WEIGHTS[mood] || MOOD_WEIGHTS.soft;

  // Filter out already-rejected colours
  const candidates = HIJAB_PALETTE.filter((c) => !rejected.includes(c.hex));

  // Score each candidate
  const scored = candidates.map((candidate) => {
    const hijabRgb = hexToRgb(candidate.hex);
    const score = scoreHijabColour(hijabRgb, outfitColours, skinTones, weights, mode);
    return { hex: candidate.hex, name: candidate.name, score, hijabRgb };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pick the top 8 and generate reasons + style tips
  const top = scored.slice(0, 8);
  const results = top.map((item) => ({
    hex: item.hex,
    name: item.name,
    reason: generateReason(item, outfitColours, skinTones, mood, mode),
    styleTip: pickStyleTip(item),
    score: item.score,
  }));

  return results;
}

// ── Scoring ──────────────────────────────────────────────────────────────

function scoreHijabColour(hijab, outfitColours, skinTones, weights, mode) {
  let score = 0;

  for (const oc of outfitColours) {
    const oh = rgbToHsl(oc).h;
    const hh = rgbToHsl(hijab).h;
    const hDiff = hueDifference(oh, hh);
    const hijabL = relativeLuminance(hijab);

    const compScore = 1 - Math.abs(hDiff - 180) / 180;
    score += compScore * weights.complement;

    const anaScore = hDiff <= 60 ? (1 - hDiff / 60) : 0;
    score += anaScore * weights.analogous;

    const sat = rgbToHsl(hijab).s;
    score += (1 - sat) * weights.neutral;
    score += sat * weights.vibrance;

    const avgOutfitL = outfitColours.reduce((sum, c) => sum + relativeLuminance(c), 0) / outfitColours.length;
    score += (1 - Math.abs(hijabL - avgOutfitL)) * weights.lightness;
  }

  for (const st of skinTones) {
    const stHsl = rgbToHsl(st);
    const hHsl = rgbToHsl(hijab);
    const hDiff = hueDifference(stHsl.h, hHsl.h);

    if (skinTones.length === 2) {
      if (mode === 'balance') {
        score += (1 - Math.min(hDiff, 360 - hDiff) / 180) * 0.3;
      } else {
        score += (Math.min(hDiff, 360 - hDiff) / 180) * 0.3;
      }
    } else {
      score += (1 - Math.min(hDiff, 360 - hDiff) / 180) * 0.2;
    }
  }

  score = outfitColours.length > 0 ? score / outfitColours.length : score;
  return Math.round(score * 10000) / 10000;
}
// ── Reason generation ────────────────────────────────────────────────────
// Uses multiple templates for variety, chosen by a hash of the hijab hex.

function generateReason(item, outfitColours, skinTones, mood, mode) {
  const hijabName = item.name;
  const hijabRgb = item.hijabRgb;
  const hh = rgbToHsl(hijabRgb).h;
  const hex = item.hex;

  let bestDiff = Infinity, bestOc = null;
  for (const oc of outfitColours) {
    const oh = rgbToHsl(oc).h;
    const d = hueDifference(oh, hh);
    if (d < bestDiff) { bestDiff = d; bestOc = oc; }
  }

  const outfitName = bestOc ? describeColour(bestOc) : 'your outfit';
  const hijabSat = rgbToHsl(hijabRgb).s;
  const hijabL = relativeLuminance(hijabRgb);

  let rel;
  if (bestDiff <= 45) rel = 'harmonises with';
  else if (bestDiff >= 135) rel = 'balances';
  else rel = 'complements';

  let desc;
  if (hijabSat < 0.2) desc = hijabL < 0.3 ? 'deep neutral' : hijabL > 0.7 ? 'pale neutral' : 'soft neutral';
  else if (hijabSat > 0.6 && hijabL > 0.4 && hijabL < 0.7) desc = 'vibrant';
  else if (hijabL < 0.3) desc = 'deep';
  else if (hijabL > 0.7) desc = 'light';
  else desc = 'rich';

  const low = hijabName.toLowerCase();
  const skinNote = skinTones.length === 2
    ? (mode === 'balance' ? ' and sits well with both of your skin tones' : ' and pops against both of your skin tones')
    : '';
  // Rotate mood endings using a different hash byte (g) for independence from the template.
  const moodEnd = (parseInt(hex.slice(3,5), 16) + parseInt(hex.slice(5,7), 16)) % 3;
  const moodNote = mood === 'soft'
    ? (['for a gentle, understated feel','with soft, subtle tones','— soft and serene'][moodEnd])
    : mood === 'bold'
    ? (['for a confident, striking statement','with bold, eye-catching contrast','— bold and powerful'][moodEnd])
    : mood === 'professional'
    ? (['for a polished, refined finish','with professional ease','— clean and composed'][moodEnd])
    : mood === 'playful'
    ? (['for a fun, energetic vibe','with a playful pop of colour','— bright and lively'][moodEnd])
    : '';

  // Pick template by hex hash for deterministic variety per colour.
  const t = (parseInt(hex.slice(1,3), 16) + parseInt(hex.slice(4,6), 16)) % 5;

  switch (t) {
    case 0:
      return `A ${desc} ${low} ${rel} the ${outfitName}${skinNote} ${moodNote}.`.replace(/\s+/g,' ').trim();
    case 1:
      return `The ${desc} ${low} ${rel} the ${outfitName} beautifully${skinNote} ${moodNote}.`.replace(/\s+/g,' ').trim();
    case 2:
      return `Try a ${desc} ${low}: it ${rel === 'harmonises with' ? 'blends with' : rel === 'balances' ? 'balances' : 'lifts'} the ${outfitName}${skinNote} ${moodNote}.`.replace(/\s+/g,' ').trim();
    case 3:
      return `This ${desc} ${low} ${rel} the ${outfitName}${skinNote} — ${moodNote}`.replace(/\s+/g,' ').trim().replace(/—\s*$/,'') + '.';
    case 4:
      return `${hijabName} tones — a ${desc} shade that ${rel === 'harmonises with' ? 'works with' : rel === 'balances' ? 'grounds' : 'accents'} the ${outfitName}${skinNote} ${moodNote}.`.replace(/\s+/g,' ').trim();
    default:
      return `A ${desc} ${low} ${rel} the ${outfitName}${skinNote} ${moodNote}.`.replace(/\s+/g,' ').trim();
  }
}

// ── Style tip selection ──────────────────────────────────────────────────
// Picks a tip deterministically from the full library using the colour hex.

function pickStyleTip(item) {
  const hex = item.hex;
  // Hash the RGB bytes for a varied but consistent tip per colour.
  const i = (parseInt(hex.slice(1,3), 16) + parseInt(hex.slice(3,5), 16) + parseInt(hex.slice(5,7), 16)) % styleTips.length;
  return styleTips[i];
}

// ── Colour description helper ───────────────────────────────────────────

function describeColour(rgb) {
  const h = rgbToHsl(rgb).h;
  const l = relativeLuminance(rgb);
  const s = rgbToHsl(rgb).s;

  if (l < 0.1) return 'deep black of your outfit';
  if (l > 0.9) return 'white of your outfit';
  if (s < 0.15) {
    return l < 0.4 ? 'dark neutral of your outfit'
         : l > 0.6 ? 'light neutral of your outfit'
         : 'neutral of your outfit';
  }

  if (h < 30 || h >= 330) return 'red tones in your outfit';
  if (h >= 30 && h < 90) return 'yellow tones in your outfit';
  if (h >= 90 && h < 150) return 'green tones in your outfit';
  if (h >= 150 && h < 210) return 'teal tones in your outfit';
  if (h >= 210 && h < 270) return 'blue tones in your outfit';
  return 'purple tones in your outfit';
}