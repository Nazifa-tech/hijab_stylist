// colour.js: small colour helpers used by the rest of the app.
//
// A colour is passed around as an object like { r: 47, g: 93, b: 74 },
// where r, g, and b are numbers from 0 to 255 (red, green, blue).
// Hex strings like "#2f5d4a" are only used when reading or showing colours.
//
// This file knows nothing about photos, screens, or hijabs.

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// ---------------------------------------------------------------------------
// Hex <-> RGB
// ---------------------------------------------------------------------------

// "#2f5d4a" (or "2f5d4a", or shorthand "#fa0") -> { r: 47, g: 93, b: 74 }
export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join(''); // "fa0" -> "ffaa00"
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// { r: 47, g: 93, b: 74 } -> "#2f5d4a"
export function rgbToHex({ r, g, b }) {
  const part = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  return '#' + part(r) + part(g) + part(b);
}

// ---------------------------------------------------------------------------
// RGB <-> HSL
// HSL describes a colour the way people think about it:
//   h = hue, the position on the colour wheel, 0 to 360 (0 red, 120 green, 240 blue)
//   s = saturation, 0 (grey) to 1 (vivid)
//   l = lightness, 0 (black) to 1 (white)
// ---------------------------------------------------------------------------

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) {
    return { h: 0, s: 0, l }; // a grey: no hue, no saturation
  }

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;

  return { h, s, l };
}

export function hslToRgb({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s; // how colourful the colour is
  const hp = (((h % 360) + 360) % 360) / 60; // which of the 6 slices of the wheel
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

// ---------------------------------------------------------------------------
// Lightness as the eye sees it
// ---------------------------------------------------------------------------

// Screens store colour in a way that is not "linear" with how much light is
// emitted, so we undo that curve first (this is called gamma correction).
function srgbToLinear(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// How bright a colour looks, from 0 (black) to 1 (white).
// Green counts for the most and blue for the least, because that is how our
// eyes work. Pure yellow looks much brighter than pure blue.
export function relativeLuminance({ r, g, b }) {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

// ---------------------------------------------------------------------------
// How different do two colours look?
// ---------------------------------------------------------------------------

// Plain RGB distance is a poor measure of "looks different": two greens can be
// far apart in RGB but look nearly the same. CIELAB is a colour space designed
// so that equal distances look about equally different to a person.
//   L = lightness (0 to 100), a = green to red, b = blue to yellow
export function rgbToLab({ r, g, b }) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  // Convert to the "XYZ" colour space, divided by the white point (D65 daylight).
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) / 1.08883;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return {
    L: 116 * f(y) - 16,
    a: 500 * (f(x) - f(y)),
    b: 200 * (f(y) - f(z)),
  };
}

// A number for "how different": 0 means identical, black vs white is about 100.
// Under about 5 most people can barely tell two colours apart.
export function colourDistance(c1, c2) {
  const p = rgbToLab(c1);
  const q = rgbToLab(c2);
  return Math.sqrt((p.L - q.L) ** 2 + (p.a - q.a) ** 2 + (p.b - q.b) ** 2);
}

// ---------------------------------------------------------------------------
// Distance between two hues on the colour wheel
// ---------------------------------------------------------------------------

// The wheel wraps around, so red at 350 and red at 10 are only 20 apart, not 340.
// Returns 0 to 180. Near 0 = similar hues (analogous), near 180 = opposite
// (complementary). The suggestion engine uses this.
export function hueDifference(h1, h2) {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}
