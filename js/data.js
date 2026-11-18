// data.js — moods, skin tone swatches, and style tips
//
// This file exports three lists:
//   moods          — array of mood objects
//   skinTones      — array of skin tone swatch objects
//   styleTips      — array of style tip objects

// ── Moods ─────────────────────────────────────────────────────────────────
// Each mood adjusts the suggestion engine's colour-theory rules.
//   id    — short key used by the suggestion engine
//   label — shown to the user
//   desc  — short description

const moods = [
  { id: 'soft',       label: 'Soft',       desc: 'Muted, analogous colours — a gentle look' },
  { id: 'bold',       label: 'Bold',       desc: 'Vibrant, complementary colours — a striking look' },
  { id: 'professional', label: 'Professional', desc: 'Subdued, neutral colours — a polished look' },
  { id: 'playful',    label: 'Playful',    desc: 'Bright, contrasting colours — an energetic look' },
];

// ── Skin tone swatches ────────────────────────────────────────────────────
// 12 swatches, from lighter to deeper, across cooler, neutral, and warmer
// undertones. Each swatch has:
//   id        — unique key
//   name      — descriptive label
//   hex       — approximate colour
//   undertone — 'cool', 'neutral', or 'warm'
// The swatches are ordered lightest to darkest (keeping undertones grouped).

const skinTones = [
  // ── Cool undertones (pinkish, bluish) ───────────────────────────────
  { id: 'cool-1', name: 'Very light cool',  hex: '#f5e0e0', undertone: 'cool' },
  { id: 'cool-2', name: 'Light cool',       hex: '#e8c8c8', undertone: 'cool' },
  { id: 'cool-3', name: 'Medium cool',      hex: '#c4a0a0', undertone: 'cool' },
  { id: 'cool-4', name: 'Deep cool',        hex: '#6b4a4a', undertone: 'cool' },
  // ── Neutral undertones (beige, olive) ───────────────────────────────
  { id: 'neut-1', name: 'Very light neutral', hex: '#f5e6d0', undertone: 'neutral' },
  { id: 'neut-2', name: 'Light neutral',      hex: '#e0c8b0', undertone: 'neutral' },
  { id: 'neut-3', name: 'Medium neutral',     hex: '#c4a080', undertone: 'neutral' },
  { id: 'neut-4', name: 'Deep neutral',       hex: '#6b5040', undertone: 'neutral' },
  // ── Warm undertones (golden, yellowish) ─────────────────────────────
  { id: 'warm-1', name: 'Very light warm', hex: '#f5dcc4', undertone: 'warm' },
  { id: 'warm-2', name: 'Light warm',      hex: '#e0c49c', undertone: 'warm' },
  { id: 'warm-3', name: 'Medium warm',     hex: '#c49c6c', undertone: 'warm' },
  { id: 'warm-4', name: 'Deep warm',       hex: '#6b4a30', undertone: 'warm' },
];

// ── Style tips ───────────────────────────────────────────────────────────
// A starter library of style tips shown alongside colour suggestions.
// Each tip has:
//   id      — unique key
//   title   — short label (e.g. "Draped wrap")
//   text    — the tip itself
//
// This is a first draft; content should be reviewed by hijab wearers.

const styleTips = [
  {
    id: 'draped-wrap',
    title: 'Draped wrap',
    text: 'A loosely wrapped hijab with one end draped over the shoulder suits both casual and formal settings.',
  },
  {
    id: 'pleated-side',
    title: 'Pleated side-pin',
    text: 'Gather soft pleats on one side and pin at the shoulder for a polished, structured look.',
  },
  {
    id: 'turbo-style',
    title: 'Turban-style wrap',
    text: 'Wrap the hijab closely around the head and tuck the ends — great for active days or a modern edge.',
  },
  {
    id: 'scarf-over-shoulder',
    title: 'Scarf style',
    text: 'For lighter fabrics, wear as a loose scarf over one shoulder; this works especially well with bold prints.',
  },
  {
    id: 'layered-front',
    title: 'Layered front',
    text: 'Create two or three layers at the front by folding the hijab before pinning — adds volume and elegance.',
  },
  {
    id: 'simple-chiffon',
    title: 'Simple chiffon drape',
    text: 'A lightweight chiffon hijab can be draped simply with an undercap for a barely-there feel that suits warm weather.',
  },
  {
    id: 'matching-under-cap',
    title: 'Matching undercap',
    text: 'Wearing an undercap in a matching colour gives a clean hairline and lets you wear a slightly sheer fabric without concern.',
  },
  {
    id: 'tucked-in',
    title: 'Tucked-in style',
    text: 'Tuck the ends into the neckline of your outfit for a neat, sporty finish that stays put.',
  },
  {
    id: 'contrast-pins',
    title: 'Contrast pins or brooch',
    text: 'Add a decorative pin or brooch at the side to elevate a simple hijab into a statement piece.',
  },
  {
    id: 'volume-at-crown',
    title: 'Volume at the crown',
    text: 'Puff out the hijab slightly at the crown before pinning — this adds height and frames the face softly.',
  },
  {
    id: 'side-drape-volume',
    title: 'Side drape with volume',
    text: 'Pull extra fabric to one side for a soft, voluminous drape that cascades past the shoulder — ideal for evening wear.',
  },
  {
    id: 'double-layer',
    title: 'Double-layer wrap',
    text: 'Use two contrasting hijabs — a lighter sheer layer over a solid base — for a rich, dimensional look that plays with colour.',
  },
  {
    id: 'french-tuck',
    title: 'French-tuck style',
    text: 'Tuck one side of the hijab into the neckline and let the other fall freely; the asymmetry creates a modern, effortless silhouette.',
  },
  {
    id: 'earring-showcase',
    title: 'Hijab with earrings',
    text: 'Wear your hijab pulled slightly behind the ear and let a statement earring peek out — a subtle way to accessorise without competing with the fabric.',
  },
  {
    id: 'satin-sleek',
    title: 'Satin sleek wrap',
    text: 'A satin-finish hijab wrapped smoothly around the head with minimal volume gives a polished, formal look that pairs well with tailored outfits.',
  },
  {
    id: 'textured-knit',
    title: 'Textured knit hijab',
    text: 'For colder months, a ribbed or knit-texture hijab adds warmth and visual interest without needing a print — keep the drape simple to let the texture shine.',
  },
];