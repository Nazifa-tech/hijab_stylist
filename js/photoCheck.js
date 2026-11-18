// photoCheck.js — brightness and sharpness checks, file type validation
//
// Accept JPEG, PNG, WebP, GIF, and HEIC (converted via heic2any before
// reading). Returns a result object:
//   { ok: true|false, tip: string|null }
// "ok" is true when the photo is usable. When false, "tip" has a friendly
// suggestion. Always includes an "allowAnyway" flag so the user can proceed.

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/heic-sequence'];

function isSupportedType(file) {
  const type = file.type?.toLowerCase() || '';
  const ext = file.name?.toLowerCase() || '';
  return SUPPORTED_TYPES.includes(type)
    || ext.endsWith('.jpg') || ext.endsWith('.jpeg')
    || ext.endsWith('.png') || ext.endsWith('.webp')
    || ext.endsWith('.gif')
    || ext.endsWith('.heic') || ext.endsWith('.heif');
}

function checkPhoto(file) {
  // 1. Check file type
  if (!isSupportedType(file)) {
    return {
      ok: false,
      tip: 'Please choose a JPEG, PNG, WebP, GIF, or HEIC photo.',
      allowAnyway: false,
    };
  }

  // For unsupported image types that are images, allow anyway
  if (!file.type?.startsWith('image/')) {
    return {
      ok: false,
      tip: 'This does not look like a photo. Please choose a photo of your outfit.',
      allowAnyway: false,
    };
  }

  // We'll return a placeholder result; the actual brightness/sharpness checks
  // are done after loading the image into a canvas
  return null; // null means "needs further checking after load"
}

// ── Image quality checks ────────────────────────────────────────────────

function checkImageQuality(imageSrc) {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.onload = () => {
      const checks = runQualityChecks(img);
      resolve(checks);
    };
    img.onerror = () => resolve({
      ok: false,
      tip: 'Could not load this photo. Try again with a different photo.',
      allowAnyway: true,
    });
    img.src = imageSrc;
  });
}

function runQualityChecks(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = 160;
  const h = Math.round(img.height * (w / img.width));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h);
  const pixels = data.data;

  // Brightness: average perceived luminance
  let totalLum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // Relative luminance (sRGB)
    const lum = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    totalLum += lum;
    count++;
  }
  const avgLum = totalLum / count;

  // Sharpness: use Laplacian variance. A blurry image has low variance.
  let laplacianVariance = 0;
  let lapCount = 0;
  // Simplified: compute local contrast as sum of absolute differences
  // between adjacent pixels
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      // Luminance at this pixel
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // Compare with right neighbour
      const rIdx = ((y) * w + (x + 1)) * 4;
      const rLum = 0.299 * pixels[rIdx] + 0.587 * pixels[rIdx + 1] + 0.114 * pixels[rIdx + 2];
      // Compare with bottom neighbour
      const bIdx = ((y + 1) * w + x) * 4;
      const bLum = 0.299 * pixels[bIdx] + 0.587 * pixels[bIdx + 1] + 0.114 * pixels[bIdx + 2];

      const dx = Math.abs(lum - rLum);
      const dy = Math.abs(lum - bLum);
      laplacianVariance += dx + dy;
      lapCount += 2;
    }
  }
  const avgSharpness = lapCount > 0 ? laplacianVariance / lapCount : 0;

  // Thresholds (tuned for phone photos)
  const TOO_DARK = 0.08;
  const TOO_BRIGHT = 0.95;
  const BLURRY = 3.0;

  const issues = [];

  if (avgLum < TOO_DARK) {
    issues.push('This photo looks quite dark — the colours might not read well. If your lens might need a wipe, please clean it.');
  } else if (avgLum > TOO_BRIGHT) {
    issues.push('This photo looks very bright — details might be washed out. Try taking the photo in a more even light.');
  }

  if (avgSharpness < BLURRY) {
    issues.push('This photo looks a little blurry. If your lens might need a wipe, it could be that.');
  }

  if (issues.length === 0) {
    return { ok: true, tip: null, allowAnyway: true };
  }

  return {
    ok: false,
    tip: issues.join(' '),
    allowAnyway: true,
  };
}