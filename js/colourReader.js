// colourReader.js — extract dominant colours from an image
//
// Takes an image (HTMLImageElement or a data URL) and returns an array of
// { r, g, b } objects representing the dominant colours, sorted by how much
// of the image they cover (most prominent first).
//
// Uses canvas to sample pixels at a reduced resolution, bins them by
// similarity, and returns the top ~5 colours.

const SAMPLE_SIZE = 48;       // resize to 48×48 before sampling
const MAX_COLOURS = 5;        // return at most 5 dominant colours
const MIN_PROMINENCE = 0.05;  // ignore colours covering less than 5% of image
const BIN_EPSILON = 40;       // colour distance threshold for binning

// ── Main function ───────────────────────────────────────────────────────

export function readDominantColours(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      try {
        const colours = sampleImage(img);
        const binned = binColours(colours);
        const sorted = binned.sort((a, b) => b.count - a.count);
        const total = sorted.reduce((sum, c) => sum + c.count, 0);
        const results = [];
        for (const bin of sorted) {
          if (results.length >= MAX_COLOURS) break;
          const ratio = bin.count / total;
          if (ratio < MIN_PROMINENCE) break;
          results.push(bin.colour);
        }
        resolve(results);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = imageSrc;
  });
}

// ── Sample image at reduced resolution ──────────────────────────────────

function sampleImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = SAMPLE_SIZE;
  const h = SAMPLE_SIZE;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  const colours = [];

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    // Skip near-transparent pixels
    if (a < 128) continue;
    colours.push({ r, g, b });
  }

  return colours;
}

// ── Bin similar colours together ───────────────────────────────────────

import { colourDistance } from './colour.js';

function binColours(colours) {
  const bins = [];

  for (const c of colours) {
    let found = false;
    for (const bin of bins) {
      if (colourDistance(c, bin.colour) < BIN_EPSILON) {
        // Merge into this bin (weighted average)
        const total = bin.count + 1;
        bin.colour.r = Math.round((bin.colour.r * bin.count + c.r) / total);
        bin.colour.g = Math.round((bin.colour.g * bin.count + c.g) / total);
        bin.colour.b = Math.round((bin.colour.b * bin.count + c.b) / total);
        bin.count++;
        found = true;
        break;
      }
    }
    if (!found) {
      bins.push({ colour: { r: c.r, g: c.g, b: c.b }, count: 1 });
    }
  }

  return bins;
}