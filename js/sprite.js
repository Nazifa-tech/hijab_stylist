// sprite.js — HTML5 Canvas sprite-sheet engine for the Hijab Stylist model.
//
// Frames are generated procedurally into an offscreen canvas (a real sprite
// sheet), then blitted with drawImage. No image files are needed, so the app
// stays asset-free while gaining real animation: a walk cycle, blinking,
// turning around, and pose changes driven by user input.
//
// The figure is a female fashion model: hourglass silhouette with a soft
// bust, nipped waist, fuller hips, an A-line dress, and a flowing hijab.



const FRAME_W = 200;
const FRAME_H = 340;

// One animation state per sprite-sheet row.
const STATES = {
  idle: { row: 0, frames: 2, fps: 1.6, loop: true },
  walk: { row: 1, frames: 6, fps: 9,   loop: true },
  turn: { row: 2, frames: 4, fps: 2.2, loop: true },
  pose: { row: 3, frames: 4, fps: 1.1, loop: true },
};
const MAX_FRAMES = 6;
const VIEWS = ['front', 'three-quarter', 'side', 'back'];

// ── Colour helpers ──────────────────────────────────────────────────────

const hx = (c) => rgbToHex(c);
const dk = (c, n) => rgbToHex({
  r: Math.max(0, c.r - n), g: Math.max(0, c.g - n), b: Math.max(0, c.b - n),
});

// ── Path helpers ────────────────────────────────────────────────────────

function fillPath(ctx, colour, build) {
  ctx.beginPath();
  build(ctx);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}

function strokePath(ctx, colour, w, alpha, build) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  build(ctx);
  ctx.strokeStyle = colour;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

function ellipse(ctx, colour, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
}

// ── Female figure ───────────────────────────────────────────────────────
// p = animation params:
//   swing   -1..1  leg/arm swing for the walk cycle
//   bob     px     vertical bounce
//   blink   0..1   1 = eyes fully closed
//   lean    -1..1  hip/shoulder sway
//   turn    0..1   how far through a turn (picks the view)
//   view    string front | three-quarter | side | back
//   armRaise 0..1  raised arm for posing

function drawFigure(ctx, c, p) {
  const { pri, acc, tri, s1, s2, hj, twoTone } = c;
  const view = p.view || 'front';
  const sw = p.swing || 0;
  const lean = p.lean || 0;
  const skinLine = dk(s1, 55);
  const hjLine = dk(hj, 35);
  const accLine = dk(acc, 40);

  ctx.save();
  ctx.translate(0, p.bob || 0);

  // Narrower silhouette for the side view, slight offset for three-quarter.
  const narrow = view === 'side' ? 0.46 : view === 'three-quarter' ? 0.86 : 1;
  const cx = 100 + (view === 'three-quarter' ? 4 : 0) + lean * 3;
  ctx.translate(cx, 0);
  ctx.scale(narrow, 1);
  ctx.translate(-100, 0);

  drawLegs(ctx, c, sw, view);
  drawDress(ctx, { pri, acc, tri, accLine }, sw, lean);
  drawArms(ctx, c, p, sw);
  drawHijabAndHead(ctx, c, p, { skinLine, hjLine, view, twoTone, s1, s2 });

  ctx.restore();
}

// Legs: slim, with a walk-cycle stride.
function drawLegs(ctx, c, sw, view) {
  const skin = hx(c.s1);
  const shoe = dk(c.tri, 60);
  const legs = view === 'side'
    ? [{ x: 100, d: sw }]
    : [{ x: 88, d: sw }, { x: 112, d: -sw }];

  for (const leg of legs) {
    const kneeX = leg.x + leg.d * 9;
    const footX = leg.x + leg.d * 17;
    const footY = 300 - Math.abs(leg.d) * 8;
    strokePath(ctx, skin, 9, 1, (g) => {
      g.moveTo(leg.x, 246);
      g.quadraticCurveTo(kneeX, 272, footX, footY);
    });
    ellipse(ctx, shoe, footX, footY + 4, 7, 4);
  }
}

// Dress: female hourglass — soft bust, nipped waist, fuller hips, A-line hem.
function drawDress(ctx, c, sw, lean) {
  const bodice = hx(c.pri);
  const skirt = hx(c.acc);
  const hem = 262 + Math.abs(sw) * 4;
  const flare = 56 + Math.abs(sw) * 12;
  const sway = sw * 7 + lean * 4;

  // Bodice: shoulders -> bust curve -> waist pinch.
  fillPath(ctx, bodice, (g) => {
    g.moveTo(66, 92);
    g.quadraticCurveTo(58, 116, 70, 132);   // left bust
    g.quadraticCurveTo(78, 142, 84, 152);   // left waist
    g.lineTo(116, 152);
    g.quadraticCurveTo(122, 142, 130, 132); // right waist
    g.quadraticCurveTo(142, 116, 134, 92);  // right bust
  });

  // Bust shaping line.
  strokePath(ctx, dk(c.pri, 38), 0.9, 0.35, (g) => {
    g.moveTo(84, 122);
    g.quadraticCurveTo(100, 130, 116, 122);
  });

  // A-line skirt: narrow at waist, flaring to the hem, swaying with the walk.
  fillPath(ctx, skirt, (g) => {
    g.moveTo(84, 150);
    g.lineTo(116, 150);
    g.quadraticCurveTo(128, 205, 100 + flare + sway, hem);
    g.quadraticCurveTo(100, hem + 9, 100 - flare + sway, hem);
    g.quadraticCurveTo(72, 205, 84, 150);
  });

  // Skirt pleat creases.
  for (const o of [-26, -9, 9, 26]) {
    strokePath(ctx, c.accLine, 0.7, 0.4, (g) => {
      g.moveTo(100 + o * 0.42, 158);
      g.quadraticCurveTo(100 + o * 0.8 + sway * 0.5, 212, 100 + o + sway, hem - 4);
    });
  }

  // Waistband.
  fillPath(ctx, hx(c.tri), (g) => {
    g.moveTo(83, 148);
    g.quadraticCurveTo(100, 152, 117, 148);
    g.quadraticCurveTo(117, 156, 100, 159);
    g.quadraticCurveTo(83, 156, 83, 148);
  });
}

// Arms: slim, swinging opposite the legs; one arm can raise for a pose.
function drawArms(ctx, c, p, sw) {
  const sleeve = hx(c.pri);
  const skin = hx(c.s1);
  const raise = p.armRaise || 0;
  const side = p.view === 'side';

  const arms = side
    ? [{ sx: 118, dir: 1, d: sw }]
    : [{ sx: 68, dir: -1, d: -sw }, { sx: 132, dir: 1, d: sw }];

  for (const a of arms) {
    const lift = a.dir > 0 ? raise : 0;
    const elbowX = a.sx + a.dir * 10 + a.d * 5;
    const elbowY = 150 - lift * 26;
    const handX = a.sx + a.dir * 14 + a.d * 11;
    const handY = 212 - lift * 74;

    strokePath(ctx, sleeve, 11, 1, (g) => {
      g.moveTo(a.sx, 96);
      g.quadraticCurveTo(elbowX, elbowY, handX, handY);
    });
    ellipse(ctx, skin, handX, handY + 7, 6, 8);
  }
}

// Hijab + head: even rounded hood, chin wrap — no dangling drape.
function drawHijabAndHead(ctx, c, p, opts) {
  const { skinLine, hjLine, view, twoTone, s1, s2 } = opts;
  const hjC = hx(c.hj);

  // 1) Hood: evenly wraps the head and neck, terminating at shoulder level
  //    on both sides (no asymmetric dangling drape).
  fillPath(ctx, hjC, (g) => {
    g.moveTo(74, 62);                                  // left temple
    g.quadraticCurveTo(66, 24, 100, 24);               // crown left→top
    g.quadraticCurveTo(134, 24, 126, 62);              // crown right
    g.quadraticCurveTo(131, 78, 140, 94);              // right cheek
    g.quadraticCurveTo(148, 110, 150, 120);            // right side to shoulder
    g.quadraticCurveTo(50, 120, 48, 110);              // across nape
    g.quadraticCurveTo(60, 94, 69, 78);                // left shoulder to cheek
    g.quadraticCurveTo(74, 62, 74, 62);                // back to temple
  });

  // Hood crease lines (symmetric).
  strokePath(ctx, hjLine, 0.9, 0.45, (g) => {
    g.moveTo(78, 42); g.quadraticCurveTo(74, 72, 60, 104);
  });
  strokePath(ctx, hjLine, 0.9, 0.45, (g) => {
    g.moveTo(122, 42); g.quadraticCurveTo(126, 72, 140, 104);
  });

  // 2) Fill the full face opening with hijab colour first (prevents bald spots
  //    when the face ellipse is smaller than the hood opening, especially in
  //    back and side views after scaling).
  ellipse(ctx, hjC, 100, 70, 18, 26);

  // 3) Face skin — drawn over the hijab fill so the skin shows for front/side views.
  //    For back view the skin is skipped, keeping only the hijab fill.
  const faceView = view === 'side' ? 'side' : view;
  if (view !== 'back') {
    if (twoTone && faceView !== 'side') {
      ctx.save();
      ctx.beginPath(); ctx.rect(82, 40, 18, 58); ctx.clip();
      ellipse(ctx, hx(s1), 100, 70, 18, 26);
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.rect(100, 40, 18, 58); ctx.clip();
      ellipse(ctx, hx(s2), 100, 70, 18, 26);
      ctx.restore();
    } else {
      ellipse(ctx, hx(s1), 100, 70, 18, 26);
    }
  }

  // 4) Chin wrap: fabric crosses UNDER the chin, over the neck.
  if (view !== 'back') {
    fillPath(ctx, hjC, (g) => {
      g.moveTo(79, 82);
      g.quadraticCurveTo(100, 104, 121, 82);
      g.quadraticCurveTo(122, 102, 120, 118);
      g.quadraticCurveTo(100, 110, 80, 118);
      g.quadraticCurveTo(78, 102, 79, 82);
    });
    strokePath(ctx, hjLine, 0.8, 0.5, (g) => {
      g.moveTo(79, 82); g.quadraticCurveTo(100, 104, 121, 82);
    });
  }

  // 5) Facial features.
  if (view === 'back') return;
  drawFaceFeatures(ctx, s1, skinLine, p.blink || 0, faceView);
}

// Female face: arched brows, almond eyes with lashes, soft nose, fuller lips.
function drawFaceFeatures(ctx, s1, line, blink, faceView) {
  const lipTop = dk(s1, 60);
  const lipLow = dk(s1, 34);

  if (faceView === 'side') {
    // Profile: single eye + lash, nose bump, lip line.
    strokePath(ctx, line, 1, 1, (g) => {
      g.moveTo(112, 63); g.quadraticCurveTo(115, 62, 117, 63.5);
    });
    strokePath(ctx, line, 0.7, 0.8, (g) => {
      g.moveTo(116, 63.5); g.lineTo(119, 62.5); // lash flick
    });
    strokePath(ctx, line, 0.9, 0.9, (g) => {
      g.moveTo(110, 58); g.quadraticCurveTo(114, 57, 117, 58.5); // brow
    });
    strokePath(ctx, line, 0.8, 0.7, (g) => {
      g.moveTo(114, 68); g.quadraticCurveTo(119, 74, 116, 80);   // nose
    });
    strokePath(ctx, lipTop, 1.1, 0.95, (g) => {
      g.moveTo(112, 85); g.quadraticCurveTo(116, 84, 119, 85.5); // lips
    });
    return;
  }

  const eyeSquash = faceView === 'three-quarter' ? 0.82 : 1;
  const eyes = [{ x: 92, k: eyeSquash }, { x: 108, k: eyeSquash }];

  // Brows.
  for (const e of eyes) {
    strokePath(ctx, line, 1, 0.9, (g) => {
      g.moveTo(e.x - 6, 59);
      g.quadraticCurveTo(e.x - 2, 56.5, e.x + 3, 58);
    });
  }

  // Eyes: open = almond + iris; blink = gentle closed curve.
  for (const e of eyes) {
    const ex = e.x, ey = 66;
    if (blink > 0.5) {
      strokePath(ctx, line, 1.1, 1, (g) => {
        g.moveTo(ex - 5 * e.k, ey);
        g.quadraticCurveTo(ex, ey + 2.6, ex + 5 * e.k, ey);
      });
      strokePath(ctx, line, 0.6, 0.8, (g) => {  // lashes closed
        g.moveTo(ex - 4 * e.k, ey + 0.6); g.lineTo(ex - 6 * e.k, ey + 2);
      });
    } else {
      fillPath(ctx, '#fdfdfc', (g) => {
        g.moveTo(ex - 5.6 * e.k, ey);
        g.quadraticCurveTo(ex, ey - 4.4, ex + 5.6 * e.k, ey);
        g.quadraticCurveTo(ex, ey + 3.2, ex - 5.6 * e.k, ey);
      });
      ellipse(ctx, dk(s1, 120), ex, ey + 0.3, 2.1, 2.4);          // iris
      ellipse(ctx, '#ffffff', ex - 0.7, ey - 0.5, 0.6, 0.6);       // glint
      strokePath(ctx, line, 0.9, 1, (g) => {                        // upper lid
        g.moveTo(ex - 5.6 * e.k, ey);
        g.quadraticCurveTo(ex, ey - 4.4, ex + 5.6 * e.k, ey);
      });
      strokePath(ctx, line, 0.6, 0.9, (g) => {                      // outer lash
        g.moveTo(ex + (e.x < 100 ? -5 : 5) * e.k, ey - 0.6);
        g.lineTo(ex + (e.x < 100 ? -7.4 : 7.4) * e.k, ey - 1.8);
      });
    }
  }

  // Nose: small, soft.
  strokePath(ctx, line, 0.75, 0.7, (g) => {
    g.moveTo(100, 71); g.quadraticCurveTo(99, 76, 98.6, 79);
  });

  // Lips: fuller female lips, two tones.
  fillPath(ctx, lipTop, (g) => {
    g.moveTo(94, 85);
    g.quadraticCurveTo(97, 82.4, 100, 84.4);
    g.quadraticCurveTo(103, 82.4, 106, 85);
    g.quadraticCurveTo(100, 87.6, 94, 85);
  });
  fillPath(ctx, lipLow, (g) => {
    g.moveTo(95, 86);
    g.quadraticCurveTo(100, 89.4, 105, 86);
    g.quadraticCurveTo(100, 87.6, 95, 86);
  });

  // Subtle cheek warmth.
  for (const ox of [-10, 10]) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ellipse(ctx, lipLow, 100 + ox, 76, 3.4, 2.2);
    ctx.restore();
  }
}

// ── Frame parameters ────────────────────────────────────────────────────
// Maps (state, frameIndex) to the drawing params used to paint that frame.

function frameParams(state, i) {
  switch (state) {
    case 'idle': {
      // frame 0 = eyes open, frame 1 = blink.
      return { view: 'front', blink: i === 1 ? 1 : 0, swing: 0, bob: 0, lean: 0 };
    }
    case 'walk': {
      // 6-frame walk cycle with stride, bob and arm/leg swing.
      const t = (i / 6) * Math.PI * 2;
      return {
        view: 'front',
        swing: Math.sin(t),
        bob: Math.abs(Math.cos(t)) * 3 - 2,
        lean: Math.sin(t) * 0.35,
        blink: 0,
      };
    }
    case 'turn': {
      // Spin: front -> three-quarter -> side -> back.
      return { view: VIEWS[i % 4], swing: 0, bob: 0, lean: 0, blink: 0 };
    }
    case 'pose': {
      const poses = [
        { view: 'front', lean: -0.55, armRaise: 0, swing: 0, bob: 0 },
        { view: 'three-quarter', lean: 0.4, armRaise: 0, swing: 0, bob: 0 },
        { view: 'front', lean: 0.5, armRaise: 1, swing: 0, bob: -1 },
        { view: 'three-quarter', lean: -0.35, armRaise: 0.6, swing: 0, bob: 0 },
      ];
      return poses[i % poses.length];
    }
    default:
      return { view: 'front', blink: 0, swing: 0, bob: 0, lean: 0 };
  }
}

// ── Sprite sheet builder ────────────────────────────────────────────────
// Renders every frame of every state into one offscreen canvas (the sheet).

function buildSpriteSheet(colours) {
  const sheet = document.createElement('canvas');
  sheet.width = FRAME_W * MAX_FRAMES;
  sheet.height = FRAME_H * Object.keys(STATES).length;
  const ctx = sheet.getContext('2d');

  for (const [state, def] of Object.entries(STATES)) {
    for (let i = 0; i < def.frames; i++) {
      const fx = i * FRAME_W;
      const fy = def.row * FRAME_H;
      ctx.save();
      ctx.translate(fx, fy);
      drawFigure(ctx, colours, frameParams(state, i));
      ctx.restore();
    }
  }
  return sheet;
}

// ── Animator ────────────────────────────────────────────────────────────
// Drives a canvas from a sprite sheet with requestAnimationFrame.
// setState() switches animation states; setView() steps the turn frames
// manually (used by the rotate buttons); setColours() rebuilds the sheet.

class Animator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'idle';
    this.sheet = null;
    this.last = 0;
    this.paused = false;
    this.pausedFrame = 0;
    // Idle blinking: eyes mostly open, brief blink every few seconds.
    this.blinkTimer = 0;
    this.blinkIn = 2.4; // seconds until next blink
    this._loop = this._loop.bind(this);
    this.raf = null;
  }

  setColours(colours) {
    this.sheet = buildSpriteSheet(colours);
  }

  setState(state) {
    if (!STATES[state]) return;
    this.state = state;
    this.paused = false;
    this.last = 0;
  }

  // Manually show a specific view while in turn state (rotate buttons).
  setView(viewName) {
    const idx = VIEWS.indexOf(viewName);
    if (idx === -1) return;
    this.state = 'turn';
    this.paused = true;
    this.pausedFrame = idx;
  }

  resume() { this.paused = false; }

  start() {
    if (!this.raf) this.raf = requestAnimationFrame(this._loop);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  _loop(ts) {
    const def = STATES[this.state];
    let frame;

    if (this.paused) {
      frame = this.pausedFrame;
    } else if (this.state === 'idle') {
      // Natural blink pattern instead of constant frame flipping.
      this.blinkTimer += 0.016;
      if (this.blinkTimer >= this.blinkIn) {
        this.blinkTimer = 0;
        this.blinkIn = 1.8 + Math.random() * 2.6;
        frame = 1; // blink
      } else if (this.blinkTimer < 0.12) {
        frame = 1;
      } else {
        frame = 0;
      }
    } else {
      if (!this.last) this.last = ts;
      const dt = (ts - this.last) / 1000;
      frame = Math.floor(dt * def.fps) % def.frames;
    }

    this._blit(def.row, frame);
    this.raf = requestAnimationFrame(this._loop);
  }

  _blit(row, frame) {
    if (!this.sheet) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.sheet,
      frame * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H,
      0, 0, this.canvas.width, this.canvas.height
    );
  }
}
