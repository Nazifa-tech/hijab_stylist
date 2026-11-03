import { test, assertEqual, assertClose, assertTrue, assertThrows } from './helper.js';
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  relativeLuminance, colourDistance, hueDifference,
} from '../js/colour.js';

// ---- hex <-> rgb ----------------------------------------------------------
test('hexToRgb reads a normal hex colour', () => {
  assertEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
  assertEqual(hexToRgb('#2f5d4a'), { r: 47, g: 93, b: 74 });
});
test('hexToRgb accepts shorthand, no hash, and capitals', () => {
  assertEqual(hexToRgb('#0f0'), { r: 0, g: 255, b: 0 });
  assertEqual(hexToRgb('0000FF'), { r: 0, g: 0, b: 255 });
});
test('hexToRgb throws on nonsense', () => {
  assertThrows(() => hexToRgb('not a colour'));
  assertThrows(() => hexToRgb('#12345'));
});
test('rgbToHex writes lowercase hex and pads small numbers', () => {
  assertEqual(rgbToHex({ r: 255, g: 0, b: 0 }), '#ff0000');
  assertEqual(rgbToHex({ r: 0, g: 5, b: 10 }), '#00050a');
});
test('rgbToHex clamps out-of-range numbers', () => {
  assertEqual(rgbToHex({ r: 300, g: -20, b: 128 }), '#ff0080');
});

// ---- rgb <-> hsl ----------------------------------------------------------
test('rgbToHsl: primary colours land on the right hue', () => {
  assertEqual(rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 1, l: 0.5 });
  assertEqual(rgbToHsl({ r: 0, g: 255, b: 0 }).h, 120);
  assertEqual(rgbToHsl({ r: 0, g: 0, b: 255 }).h, 240);
});
test('rgbToHsl: black, white, and greys have no saturation', () => {
  assertEqual(rgbToHsl({ r: 0, g: 0, b: 0 }), { h: 0, s: 0, l: 0 });
  assertEqual(rgbToHsl({ r: 255, g: 255, b: 255 }), { h: 0, s: 0, l: 1 });
  assertEqual(rgbToHsl({ r: 128, g: 128, b: 128 }).s, 0);
});
test('rgb -> hsl -> rgb gives back the same colour', () => {
  const samples = ['#2f5d4a', '#d8c3a5', '#d9a5a0', '#f3ead7', '#c49a6c', '#000000', '#ffffff', '#808080', '#123456'];
  for (const hex of samples) {
    const original = hexToRgb(hex);
    const back = hslToRgb(rgbToHsl(original));
    assertTrue(
      Math.abs(back.r - original.r) <= 1 && Math.abs(back.g - original.g) <= 1 && Math.abs(back.b - original.b) <= 1,
      `Round trip failed for ${hex}`
    );
  }
});
test('hslToRgb handles hues outside 0 to 360', () => {
  assertEqual(hslToRgb({ h: 360, s: 1, l: 0.5 }), { r: 255, g: 0, b: 0 });
  assertEqual(hslToRgb({ h: -120, s: 1, l: 0.5 }), { r: 0, g: 0, b: 255 });
});

// ---- lightness ------------------------------------------------------------
test('relativeLuminance: black is 0, white is 1', () => {
  assertClose(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
  assertClose(relativeLuminance({ r: 255, g: 255, b: 255 }), 1);
});
test('relativeLuminance: green looks brighter than red, red brighter than blue', () => {
  const red = relativeLuminance({ r: 255, g: 0, b: 0 });
  const green = relativeLuminance({ r: 0, g: 255, b: 0 });
  const blue = relativeLuminance({ r: 0, g: 0, b: 255 });
  assertTrue(green > red && red > blue);
});

// ---- distance -------------------------------------------------------------
test('colourDistance: identical colours are 0 apart', () => {
  assertClose(colourDistance(hexToRgb('#2f5d4a'), hexToRgb('#2f5d4a')), 0);
});
test('colourDistance: black and white are about 100 apart', () => {
  const d = colourDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
  assertTrue(d > 99 && d < 101, `Got ${d}`);
});
test('colourDistance: nearly identical colours are close, different ones far', () => {
  const near = colourDistance(hexToRgb('#ff0000'), hexToRgb('#fe0000'));
  const far = colourDistance(hexToRgb('#ff0000'), hexToRgb('#0000ff'));
  assertTrue(near < 2, `near was ${near}`);
  assertTrue(far > 50, `far was ${far}`);
});
test('colourDistance is symmetrical', () => {
  const a = hexToRgb('#d8c3a5');
  const b = hexToRgb('#2f5d4a');
  assertClose(colourDistance(a, b), colourDistance(b, a));
});

// ---- hue difference -------------------------------------------------------
test('hueDifference wraps around the colour wheel', () => {
  assertEqual(hueDifference(350, 10), 20);
  assertEqual(hueDifference(10, 350), 20);
});
test('hueDifference: same is 0, opposite is 180', () => {
  assertEqual(hueDifference(90, 90), 0);
  assertEqual(hueDifference(0, 180), 180);
});
