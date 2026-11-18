// app.js — Hijab Stylist wiring & screens
//
// The #js-fail overlay is visible by default (set in index.html) so that if
// this script never loads — or crashes partway through — the user sees a
// helpful message instead of a blank black page. We hide it only AFTER the
// entire app has initialised successfully. If anything throws, we leave the
// overlay in place and log the error to the console.

(function () {
  try {
    boot();
  } catch (err) {
    // Restore the overlay so the user isn't left staring at a black screen.
    const fail = document.getElementById('js-fail');
    if (fail) {
      fail.style.display = 'flex';
      const msg = fail.querySelector('p');
      if (msg) msg.textContent = 'Something went wrong while loading the app. Try refreshing. If the problem persists, open this site from a web server (not as a local file) and check the browser console for details.';
    }
    console.error('[Hijab Stylist] Boot failed:', err);
  }
})();

function boot() {
  // The app loaded successfully — hide the fallback overlay.
  document.getElementById('js-fail').style.display = 'none';







const state = {
  step:1, colours:[], mood:'soft', skinSelections:[],
  suggestions:[], contrastMode:false, rejectedHexes:[], photoUrl:null, modelView:0, selectedHijab:null, showCount:3,
};
const screens = {
  upload:document.getElementById('screen-upload'),
  confirm:document.getElementById('screen-confirm'),
  vibe:document.getElementById('screen-vibe'),
  recs:document.getElementById('screen-recs'),
  favourites:document.getElementById('screen-favourites'),
};
function showScreen(id) {
  for (const[k,el]of Object.entries(screens)) el.style.display=k===id?'block':'none';
}
function showTip(msg) {
  const el=document.getElementById('tip-area');
  el.textContent=msg;el.style.display='block';
}

// Step 1: Upload
async function handleUpload() {
  const file=document.getElementById('photo-input').files?.[0];
  if (!file) return;
  const check=checkPhoto(file);
  if (check&&!check.ok){showTip(check.tip);return;}
  state.photoUrl=URL.createObjectURL(file);
  try {
    const colours=await readDominantColours(state.photoUrl);
    state.colours=colours;renderConfirmScreen(colours);
    showScreen('confirm');state.step=2;
  }catch{showTip('Could not read colours.');}
}
document.getElementById('upload-button')?.addEventListener('click',handleUpload);

// Step 2: Confirm colours
function renderConfirmScreen(colours) {
  const c=document.getElementById('colour-swatches');
  c.innerHTML=colours.map((cl,i)=>
    `<div class="swatch" data-index="${i}"><span class="swatch-colour" style="background:${rgbToHex(cl)}"></span><button class="swatch-remove" data-index="${i}">✕</button></div>`
  ).join('');
}
document.getElementById('confirm-button')?.addEventListener('click',()=>{
  if (state.colours.length<1){showTip('Keep one colour.');return;}
  renderVibeScreen();showScreen('vibe');state.step=3;
});
document.getElementById('confirm-retry')?.addEventListener('click',()=>{
  showScreen('upload');state.step=1;
  document.getElementById('tip-area').style.display='none';
});

// Step 3: Set vibe
function renderVibeScreen() {
  document.getElementById('mood-buttons').innerHTML=moods.map(m=>
    `<button class="mood-btn${m.id===state.mood?' selected':''}" data-mood="${m.id}">${m.label}</button>`
  ).join('');
  document.getElementById('skin-grid').innerHTML=skinTones.map(s=>
    `<button class="skin-btn${state.skinSelections.includes(s.id)?' selected':''}" style="background:${s.hex}" data-skin="${s.id}" title="${s.name}"></button>`
  ).join('');
}
document.getElementById('contrast-toggle')?.addEventListener('change',()=>{
  if (!document.getElementById('contrast-toggle')?.checked&&state.skinSelections.length>1){
    state.skinSelections=[state.skinSelections[0]];renderVibeScreen();
  }
});
document.getElementById('vibe-next')?.addEventListener('click',()=>{
  if (state.skinSelections.length<1){showTip('Select skin tone.');return;}
  state.contrastMode=document.getElementById('contrast-toggle')?.checked||false;
  if (!state.contrastMode&&state.skinSelections.length>1) state.skinSelections=[state.skinSelections[0]];
  if (state.skinSelections.length===1) savePreference('skinTone',state.skinSelections[0]);
  const sk=state.skinSelections.map(id=>{const s=skinTones.find(t=>t.id===id);return s?hexToRgb(s.hex):{r:200,g:180,b:160};});
  state.suggestions=suggest(state.colours,state.mood,sk,{mode:state.contrastMode?'contrast':'balance',rejected:state.rejectedHexes});
  state.showCount=3;renderRecsScreen();showScreen('recs');state.step=4;
});

// Step 4: Recommendations
function getOutfitId(){return `o:${state.colours.map(c=>rgbToHex(c)).sort().join(',')}:${state.mood}`;}
function renderRecsScreen() {
  const oid=getOutfitId();
  const all = state.suggestions;
  const visible = all.slice(0, state.showCount);
  let html = '<h3 class="styles-heading">Styles for you</h3>';
  html += visible.map(s=>{
    const fav=isFavourite(oid,s.hex),rej=isRejected(oid,s.hex);
    return `<div class="suggestion" data-hex="${s.hex}"><button class="suggestion-swatch" style="background:${s.hex}"></button><div class="suggestion-info"><p class="suggestion-reason">${s.reason}</p><p class="suggestion-tip"><strong>Tip:</strong> ${s.styleTip.text}</p></div><div class="suggestion-actions"><button class="fav-btn${fav?' active':''}" data-hex="${s.hex}">♥</button><button class="reject-btn${rej?' active':''}" data-hex="${s.hex}">✕</button></div></div>`;
  }).join('');
  if (all.length > 3) {
    if (state.showCount < all.length) {
      html += `<button class="view-more-btn">View here to explore more</button>`;
    } else {
      html += `<button class="view-more-btn back">Show fewer</button>`;
    }
  }
  document.getElementById('suggestion-buttons').innerHTML = html;
  updateModelPreview();
}
const animator = new Animator(document.getElementById('model-canvas'));

function updateModelPreview() {
  const sk=state.skinSelections.map(id=>{const s=skinTones.find(t=>t.id===id);return s?hexToRgb(s.hex):{r:200,g:180,b:160};});
  const hj=state.selectedHijab?hexToRgb(state.selectedHijab):(state.suggestions.length>0?hexToRgb(state.suggestions[0].hex):{r:128,g:128,b:128});
  animator.setColours({pri:state.colours[0]||{r:128,g:128,b:128},acc:state.colours[1]||state.colours[0]||{r:128,g:128,b:128},tri:state.colours[2]||state.colours[0]||{r:128,g:128,b:128},s1:sk[0]||{r:200,g:180,b:160},s2:sk[1]||sk[0]||{r:200,g:180,b:160},hj:hj,twoTone:sk.length===2});
  animator.start();
  if (state.photoUrl) document.getElementById('photo-preview').src=state.photoUrl;
}

// Favourites
function renderFavourites(){
  const favs=getFavourites();
  const c=document.getElementById('favourites-list');
  if (favs.length===0){c.innerHTML='<p>No favourites yet.</p>';return;}
  c.innerHTML=favs.map(f=>`<div class="fav-item"><span style="background:${f.hex};display:inline-block;width:32px;height:32px;"></span><span>${colourName(f.hex)}</span><button class="fav-remove" data-hex="${f.hex}" data-outfit="${f.outfitId}">Remove</button></div>`).join('');
}
document.getElementById('nav-favourites')?.addEventListener('click',()=>{renderFavourites();state.step='favourites';showScreen('favourites');});
document.getElementById('nav-back')?.addEventListener('click',()=>{
  if (state.step==='favourites'){renderRecsScreen();showScreen('recs');state.step=4;return;}
  const p=typeof state.step==='number'?state.step-1:1;
  if(p>=1){state.step=p;const m={4:'recs',3:'vibe',2:'confirm',1:'upload'};showScreen(m[p]||'upload');}
});

// Global click handler
document.addEventListener('click',e=>{
  const t=e.target;
  // Logo click → homepage (the upload screen). We prevent the full page
  // reload so the in-page state is kept, but the href still works for
  // middle-click / "open in new tab".
  const logoLink = t.closest && t.closest('.logo-area');
  if (logoLink){
    e.preventDefault();
    document.getElementById('tip-area').style.display='none';
    showScreen('upload');
    state.step=1;
    return;
  }
  if (t.matches('#theme-toggle')){
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('hijab-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }else if (t.matches('.mood-btn')){state.mood=t.dataset.mood;renderVibeScreen();}
  else if (t.matches('.skin-btn')){
    const id=t.dataset.skin,i=state.skinSelections.indexOf(id);
    if (i>=0) state.skinSelections.splice(i,1);
    else if (state.skinSelections.length < 1 + (document.getElementById('contrast-toggle')?.checked ? 1 : 0)) state.skinSelections.push(id);
    // If contrast is off and there's already 1 selected, replace it.
    else if (!document.getElementById('contrast-toggle')?.checked) state.skinSelections = [id];
    renderVibeScreen();
  }else if (t.matches('.swatch-remove')){state.colours.splice(Number(t.dataset.index),1);renderConfirmScreen(state.colours);}
  else if (t.matches('.fav-btn')){
    const hex=t.dataset.hex,oid=getOutfitId();
    if (isFavourite(oid,hex)) removeFavourite(oid,hex); else saveFavourite(oid,hex);
    renderRecsScreen();
  }else if (t.matches('.reject-btn')){
    const hex=t.dataset.hex,oid=getOutfitId();
    if (isRejected(oid,hex)) removeRejection(oid,hex); else saveRejection(oid,hex);
    renderRecsScreen();
  }else if (t.matches('.view-more-btn')){state.showCount=state.showCount<state.suggestions.length?state.showCount+2:3;renderRecsScreen();}
  else if (t.closest('.suggestion') && t.closest('.suggestion').dataset.hex && !t.closest('.suggestion-actions')){
    state.selectedHijab=t.closest('.suggestion').dataset.hex;updateModelPreview();
  }else if (t.matches('.rotate-btn')) {
    if (t.id==='rotate-right') state.modelView=(state.modelView+1)%VIEWS.length;
    else state.modelView=(state.modelView-1+VIEWS.length)%VIEWS.length;
    animator.setView(VIEWS[state.modelView]);
  }else if (t.matches('.anim-btn')){
    document.querySelectorAll('.anim-btn').forEach(b=>b.classList.toggle('active',b===t));
    animator.setState(t.dataset.state);
  }else if (t.matches('.fav-remove')){removeFavourite(t.dataset.outfit,t.dataset.hex);renderFavourites();}
});

// Init
  const savedSkin=getPreference('skinTone');
  if (savedSkin) state.skinSelections=[savedSkin];
  showScreen('upload');
  console.log('Hijab Stylist booted');
} // end boot()