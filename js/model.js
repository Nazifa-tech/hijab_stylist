// model.js — detailed 2D fashion illustration, 4 views, natural hijab
import { rgbToHex } from './colour.js';
function hex(c){return c?rgbToHex(c):'#888';}
function dk(c,n){return rgbToHex({r:Math.max(0,c.r-n),g:Math.max(0,c.g-n),b:Math.max(0,c.b-n)});}

// ── Front view ──────────────────────────────────────────────────────────
function frontView(pri,acc,tri,s1,s2,hj,twoTone){
  const S=[],lk=dk(s1,55),hk=dk(hj,35),pk=dk(pri,40),ak=dk(acc,40);
  const H=hex;
  // Torso
  S.push(`<path d="M 32,80 Q 30,105 38,135 Q 34,165 40,170 L 160,170 Q 165,135 158,105 Q 162,80 160,80 Z" fill="${H(pri)}"/>`);
  // Skirt A-line
  S.push(`<path d="M 36,145 L 164,145 Q 150,205 6,275 Q 194,275 172,205 Z" fill="${H(acc)}"/>`);
  // Skirt folds
  S.push(`<path d="M 50,150 Q 48,200 42,260" fill="none" stroke="${ak}" stroke-width="0.7" opacity="0.5"/>`);
  S.push(`<path d="M 70,152 Q 68,210 60,270" fill="none" stroke="${ak}" stroke-width="0.6" opacity="0.4"/>`);
  S.push(`<path d="M 150,150 Q 148,200 155,260" fill="none" stroke="${ak}" stroke-width="0.7" opacity="0.5"/>`);
  // Waistband
  S.push(`<path d="M 35,144 Q 100,147 165,144 Q 165,150 100,152 35,150 Z" fill="${H(tri)}"/>`);
  // Sleeves
  S.push(`<path d="M 28,80 Q 24,115 18,165 Q 14,200 12,235 L 22,235 Q 24,195 28,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 172,80 Q 176,115 182,165 Q 186,200 188,235 L 178,235 Q 176,195 172,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 11,230 Q 18,233 23,230" fill="none" stroke="${pk}" stroke-width="0.8" opacity="0.6"/>`);
  S.push(`<path d="M 177,230 Q 182,233 189,230" fill="none" stroke="${pk}" stroke-width="0.8" opacity="0.6"/>`);
  // Hands
  S.push(`<ellipse cx="14" cy="242" rx="7" ry="10" fill="${H(s1)}"/>`);
  S.push(`<ellipse cx="186" cy="242" rx="7" ry="10" fill="${H(s1)}"/>`);
  S.push(`<path d="M 10,245 L 12,248 L 15,250" fill="none" stroke="${lk}" stroke-width="0.6" opacity="0.4"/>`);
  S.push(`<path d="M 190,245 L 188,248 L 185,250" fill="none" stroke="${lk}" stroke-width="0.6" opacity="0.4"/>`);
// ── Hijab — flowing fabric, NOT a rectangle ─────────────────────────
  S.push(`<path d="M 25,18 Q 48,24 72,30 Q 82,42 88,54 Q 90,68 88,82 Q 84,98 78,114 Q 70,132 56,156 L 48,176 L 164,176 Q 158,144 170,118 Q 180,96 186,78 Q 190,62 194,48 Q 192,34 184,22 Q 176,14 172,18 Z" fill="${hex(hj)}"/>`);
  // Fabric fold lines
  S.push(`<path d="M 42,30 Q 38,60 34,90 Q 30,120 28,150 Q 26,170 24,180 Z" fill="none" stroke="${hk}" stroke-width="1" opacity="0.5"/>`);
  S.push(`<path d="M 28,155 Q 38,160 50,170" fill="none" stroke="${hk}" stroke-width="0.7" opacity="0.4"/>`);
  S.push(`<path d="M 158,30 Q 162,60 166,90 Q 168,120 166,150 Q 164,170 162,180 Z" fill="none" stroke="${hk}" stroke-width="0.8" opacity="0.4"/>`);
  S.push(`<path d="M 158,50 Q 168,55 175,65" fill="none" stroke="${hk}" stroke-width="0.6" opacity="0.3"/>`);

  // Front drape (left side — longer drape over chest)
  S.push(`<path d="M 52,82 Q 46,110 38,145 Q 32,175 28,200 L 24,215 L 40,215 Q 46,185 52,82 Z" fill="${hex(hj)}"/>`);
  S.push(`<path d="M 36,95 Q 32,125 28,158 Q 26,180 28,200 Z" fill="none" stroke="${hk}" stroke-width="0.9" opacity="0.5"/>`);
  S.push(`<path d="M 44,100 Q 40,130 34,165 Q 30,190 34,210 Z" fill="none" stroke="${hk}" stroke-width="0.6" opacity="0.35"/>`);
  S.push(`<path d="M 28,200 Q 32,175 38,145 Q 46,110 52,82" fill="none" stroke="${hk}" stroke-width="1" opacity="0.6"/>`);

  // Right side wrap (tucked)
  S.push(`<path d="M 162,82 Q 166,105 170,130 Q 168,155 162,170 Z" fill="${hex(hj)}" opacity="0.9"/>`);

  // Undercap
  const uc={r:245,g:240,b:235};
  S.push(`<path d="M 58,24 Q 100,28 145,24 Q 150,30 100,32 58,28 Z" fill="${hex(uc)}" opacity="0.6"/>`);

  // ── Face ──────────────────────────────────────────────────────────
  const fx=100,fy=52,rx=19,ry=25;
  if(twoTone){
    S.push(`<ellipse cx="${fx-3}" cy="${fy}" rx="${rx}" ry="${ry}" fill="${hex(s1)}" clip-path="url(#hl)"/>`);
    S.push(`<ellipse cx="${fx+3}" cy="${fy}" rx="${rx}" ry="${ry}" fill="${hex(s2)}" clip-path="url(#hr)"/>`);
  }else{S.push(`<ellipse cx="${fx}" cy="${fy}" rx="${rx}" ry="${ry}" fill="${hex(s1)}"/>`);}

  // Eyes (almond with lashes)
  S.push(`<path d="M 86,44 Q 90,42.5 94,44 Q 96,44.5 94,44 L 88,44.5 Z" fill="${lk}" stroke="${lk}" stroke-width="0.5"/>`);
  S.push(`<path d="M 114,44 Q 110,42.5 106,44 Q 104,44.5 106,44 L 112,44.5 Z" fill="${lk}" stroke="${lk}" stroke-width="0.5"/>`);
  S.push(`<path d="M 88,45 Q 86,46 84,46.5" fill="none" stroke="${lk}" stroke-width="0.5" opacity="0.7"/>`);
  S.push(`<path d="M 112,45 Q 114,46 116,46.5" fill="none" stroke="${lk}" stroke-width="0.5" opacity="0.7"/>`);
  // Eyebrows
  S.push(`<path d="M 84,39 Q 88,38 92,39 Q 94,39.5 95,40" fill="none" stroke="${lk}" stroke-width="1" stroke-linecap="round"/>`);
  S.push(`<path d="M 116,39 Q 112,38 108,39 Q 106,39.5 105,40" fill="none" stroke="${lk}" stroke-width="1" stroke-linecap="round"/>`);
  // Nose
  S.push(`<path d="M 100,52 L 100,58 Q 100,62 99,61" fill="none" stroke="${lk}" stroke-width="0.7" stroke-linecap="round"/>`);
  S.push(`<path d="M 99,61 Q 102,61 103,62" fill="none" stroke="${lk}" stroke-width="0.5" opacity="0.5"/>`);
  // Lips
  S.push(`<path d="M 93,70 Q 98,68 103,70 Q 100,71 97,70 L 93,71" fill="${dk(s1,40)}" stroke="${lk}" stroke-width="0.6"/>`);
  S.push(`<path d="M 94,72 Q 99,71 104,72 Q 100,73 98,72 L 93,73" fill="${dk(s1,25)}" stroke="${lk}" stroke-width="0.4"/>`);
  // Jaw
  S.push(`<path d="M 92,75 Q 100,77 108,75" fill="none" stroke="${lk}" stroke-width="0.5" opacity="0.2"/>`);
  return S.join('\n');
}
// ── Three-quarter view ──────────────────────────────────────────────────
function threeQuarterView(pri,acc,tri,s1,s2,hj,twoTone){
  const S=[],lk=dk(s1,55),hk=dk(hj,35),H=hex;
  S.push(`<path d="M 22,80 Q 20,105 30,135 Q 26,165 32,170 L 168,170 Q 173,135 163,105 Q 167,80 165,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 28,145 L 170,145 Q 155,205 4,275 Q 200,275 175,205 Z" fill="${H(acc)}"/>`);
  S.push(`<path d="M 18,80 Q 14,115 8,165 Q 4,200 2,235 L 14,235 Q 16,195 18,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 178,80 Q 182,115 188,165 Q 192,200 194,235 L 182,235 Q 180,195 178,80 Z" fill="${H(pri)}"/>`);
  S.push(`<ellipse cx="4" cy="242" rx="6" ry="9" fill="${H(s1)}"/>`);
  S.push(`<ellipse cx="192" cy="242" rx="6" ry="9" fill="${H(s1)}"/>`);

  S.push(`<path d="M 18,20 Q 42,26 68,32 Q 78,44 85,56 Q 86,70 84,84 Q 80,100 74,116 Q 66,134 50,158 L 42,178 L 170,178 Q 164,146 176,120 Q 186,98 192,80 Q 196,64 200,50 Q 198,36 190,24 Q 180,16 176,20 Z" fill="${H(hj)}"/>`);
  S.push(`<path d="M 34,34 Q 30,64 26,94 Q 22,124 20,154" fill="none" stroke="${hk}" stroke-width="0.8" opacity="0.5"/>`);
  S.push(`<path d="M 42,85 Q 36,115 30,148 Q 26,178 24,200 L 22,210 L 36,210 Q 42,182 42,85 Z" fill="${H(hj)}"/>`);
  S.push(`<path d="M 34,100 Q 30,130 26,162" fill="none" stroke="${hk}" stroke-width="0.7" opacity="0.45"/>`);

  const fx=97,fy=52,rx=17,ry=24;
  if(twoTone){
    S.push(`<ellipse cx="${fx-3}" cy="${fy}" rx="${rx}" ry="${ry}" fill="${H(s1)}" clip-path="url(#hl)"/>`);
    S.push(`<ellipse cx="${fx+3}" cy="${fy}" rx="${rx}" ry="${ry}" fill="${H(s2)}" clip-path="url(#hr)"/>`);
  }else{S.push(`<ellipse cx="${fx}" cy="${fy}" rx="${rx}" ry="${ry}" fill="${H(s1)}"/>`);}
  S.push(`<path d="M 87,44 Q 90,42.5 93,44" fill="none" stroke="${lk}" stroke-width="0.7"/>`);
  S.push(`<path d="M 106,45 Q 109,43.5 112,45" fill="none" stroke="${lk}" stroke-width="0.7"/>`);
  S.push(`<path d="M 85,39 Q 88,38 91,39" fill="none" stroke="${lk}" stroke-width="0.9" stroke-linecap="round"/>`);
  S.push(`<path d="M 107,40 Q 110,39 113,40" fill="none" stroke="${lk}" stroke-width="0.9" stroke-linecap="round"/>`);
  S.push(`<path d="M 97,52 L 97,58 Q 97,61 96,60" fill="none" stroke="${lk}" stroke-width="0.6" stroke-linecap="round"/>`);
  S.push(`<path d="M 92,70 Q 96,68 100,70" fill="none" stroke="${lk}" stroke-width="0.8"/>`);
  return S.join('\n');
}

// ── Side view ──────────────────────────────────────────────────────────
function sideView(pri,acc,tri,s1,s2,hj,twoTone){
  const S=[],lk=dk(s1,55),hk=dk(hj,35),H=hex;
  S.push(`<path d="M 98,80 Q 96,105 102,135 Q 100,165 102,170 L 128,170 Q 130,135 126,105 Q 128,80 126,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 100,145 L 130,145 Q 125,205 90,275 Q 140,275 132,205 Z" fill="${H(acc)}"/>`);
  S.push(`<path d="M 130,80 Q 134,115 140,165 Q 144,200 146,235 L 134,235 Q 132,195 130,80 Z" fill="${H(pri)}"/>`);
  S.push(`<ellipse cx="146" cy="242" rx="7" ry="10" fill="${H(s1)}"/>`);

  S.push(`<path d="M 95,18 Q 100,24 108,32 Q 115,44 120,56 Q 122,70 120,86 Q 116,102 110,120 Q 104,138 96,158 L 90,178 L 132,178 Q 134,146 136,120 Q 138,98 140,80 Q 142,62 140,46 Q 138,32 134,22 Z" fill="${H(hj)}"/>`);
  S.push(`<path d="M 98,90 Q 94,120 88,155 Q 84,182 82,200 L 80,210 L 94,210 Q 100,182 98,90 Z" fill="${H(hj)}"/>`);
  S.push(`<path d="M 105,60 Q 108,92 114,124 Q 116,154 115,176 Z" fill="none" stroke="${hk}" stroke-width="0.8" opacity="0.5"/>`);
  S.push(`<path d="M 92,104 Q 88,134 84,166" fill="none" stroke="${hk}" stroke-width="0.7" opacity="0.45"/>`);

  S.push(`<ellipse cx="118" cy="52" rx="10" ry="24" fill="${H(s1)}"/>`);
  if(twoTone){S.push(`<ellipse cx="118" cy="52" rx="10" ry="24" fill="${H(s2)}" opacity="0.5"/>`);}
  S.push(`<path d="M 124,44 Q 126,43 128,44.5" fill="none" stroke="${lk}" stroke-width="0.7"/>`);
  S.push(`<path d="M 122,39 Q 125,38 127,39" fill="none" stroke="${lk}" stroke-width="0.8" stroke-linecap="round"/>`);
  S.push(`<path d="M 128,54 L 133,62 Q 133,65 132,64" fill="none" stroke="${lk}" stroke-width="0.7" stroke-linecap="round"/>`);
  S.push(`<path d="M 120,70 Q 125,68 131,70" fill="none" stroke="${lk}" stroke-width="0.8"/>`);
  return S.join('\n');
}
// ── Back view ──────────────────────────────────────────────────────────
function backView(pri,acc,tri,s1,s2,hj,twoTone){
  const S=[],hk=dk(hj,35),H=hex;
  S.push(`<path d="M 32,80 Q 30,105 38,135 Q 34,165 40,170 L 160,170 Q 165,135 158,105 Q 162,80 160,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 36,145 L 164,145 Q 150,205 6,275 Q 194,275 172,205 Z" fill="${H(acc)}"/>`);
  S.push(`<path d="M 28,80 Q 24,115 18,165 Q 14,200 12,235 L 22,235 Q 24,195 28,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 172,80 Q 176,115 182,165 Q 186,200 188,235 L 178,235 Q 176,195 172,80 Z" fill="${H(pri)}"/>`);
  S.push(`<path d="M 20,16 Q 42,22 66,30 Q 84,42 92,56 Q 94,72 92,90 Q 88,110 80,134 Q 70,158 54,180 L 46,176 L 168,176 Q 162,144 174,118 Q 184,96 190,76 Q 194,60 198,44 Q 196,30 186,20 Q 176,14 172,18 Z" fill="${H(hj)}"/>`);
  S.push(`<path d="M 38,36 Q 34,68 30,100 Q 26,132 24,164 Z" fill="none" stroke="${hk}" stroke-width="0.8" opacity="0.5"/>`);
  S.push(`<path d="M 162,38 Q 166,70 172,104 Q 174,136 172,166 Z" fill="none" stroke="${hk}" stroke-width="0.8" opacity="0.5"/>`);
  S.push(`<path d="M 48,90 Q 44,122 36,158 Q 30,184 28,200 L 24,210 L 38,210 Q 44,182 48,90 Z" fill="${H(hj)}"/>`);
  S.push(`<ellipse cx="100" cy="50" rx="16" ry="22" fill="${hex(hj)}" opacity="0.4"/>`);
  return S.join('\n');
}

// ── Main export ─────────────────────────────────────────────────────────
export function getViews(){return['front','three-quarter','side','back'];}
export function renderModel(outfitColours,hijabColour,skinTones,view='front'){
  const pri=outfitColours.length>0?outfitColours[0]:{r:128,g:128,b:128};
  const acc=outfitColours.length>1?outfitColours[1]:pri;
  const tri=outfitColours.length>2?outfitColours[2]:acc;
  const s1=skinTones.length>0?skinTones[0]:{r:224,g:200,b:176};
  const s2=skinTones.length>1?skinTones[1]:s1;
  const hj=hijabColour||{r:128,g:128,b:128};
  const twoTone=skinTones.length===2;
  const S=[];
  S.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 340" width="100%" height="100%">`);
  S.push(`<defs><clipPath id="hl"><rect x="0" y="0" width="100" height="340"/></clipPath><clipPath id="hr"><rect x="100" y="0" width="100" height="340"/></clipPath></defs>`);
  let body;
  switch(view){
    case'three-quarter':body=threeQuarterView(pri,acc,tri,s1,s2,hj,twoTone);break;
    case'side':body=sideView(pri,acc,tri,s1,s2,hj,twoTone);break;
    case'back':body=backView(pri,acc,tri,s1,s2,hj,twoTone);break;
    default:body=frontView(pri,acc,tri,s1,s2,hj,twoTone);break;
  }
  S.push(body);S.push('</svg>');
  return S.join('\n');
}