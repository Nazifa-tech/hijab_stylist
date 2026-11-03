# Hijab Stylist: Version 1 Implementation Plan

Date: 2026-10-07
Status: Draft, awaiting review
Spec: `docs/superpowers/specs/2026-10-07-hijab-stylist-design.md` (approved)

## How to read this plan

The build is split into small tasks. Each task has one goal, the files it
touches, and a "done when" check, so you always know whether it worked before
moving on. The order is chosen so you have something that works early, and
each task builds on the one before.

The most important idea: **the suggestion engine comes first and is built
without any photo or screen.** It is the heart of the app and the part you can
test with plain examples.

## Technical choices

- **Plain HTML, CSS, and JavaScript.** No frameworks, no build tools, no
  package manager. One static site.
- **JavaScript modules** (`import` / `export`) so each file has one job. The
  browser blocks modules when a page is opened by double-clicking the file, so
  during development you run one command in the project folder:
  `python -m http.server`. It only needs to run while you work. The finished
  app is plain static files and needs no server of its own.
- **Tests are a simple web page** (`tests/index.html`) that runs checks and
  shows pass or fail. No testing library to learn.
- **Libraries (kept to the minimum):** one for HEIC conversion (heic2any, from
  a CDN). Everything else is written by hand. The exact CDN link and version
  get checked when we reach that task.
- **Hosting:** any free static host (GitHub Pages or Netlify). Chosen at the end.

## File layout

```
hijab-stylist/
  index.html
  css/styles.css
  js/
    colour.js        colour maths helpers (no screen, no photo)
    data.js          moods, skin tone swatches, style tips
    suggest.js       the suggestion engine
    storage.js       favourites, rejections, preferences
    colourReader.js  dominant colours from an image
    photoCheck.js    brightness and sharpness checks, file types
    model.js         draws the illustrated model
    app.js           screens and wiring
  tests/
    index.html       test runner page
    colour.test.js
    suggest.test.js
    storage.test.js
```

## Tasks

### Task 1: Project setup
- **Goal:** an empty page that loads, in a git repository.
- **Files:** `index.html`, `css/styles.css`, `js/app.js`.
- **Done when:** running `python -m http.server` and opening the page shows a
  heading, and `app.js` logs a message to the browser console.

### Task 2: Colour helpers
- **Goal:** small functions the rest of the app relies on: convert between
  RGB, hex, and HSL; measure how different two colours are; measure lightness.
- **Files:** `js/colour.js`, `tests/index.html`, `tests/colour.test.js`.
- **Done when:** the test page shows all colour checks passing, including edge
  cases (pure black, pure white, greys).

### Task 3: Data (moods, skin tones, style tips)
- **Goal:** the fixed lists the app uses: four moods, twelve skin tone swatches
  (cooler, neutral, warmer undertones, lighter to deeper), and a starter
  library of style tips.
- **Files:** `js/data.js`.
- **Done when:** the file exports all three lists, and every swatch has a name,
  a hex colour, and an undertone.
- **Note:** the swatch colours and the style tips are content, not code. They
  should be reviewed by people with a range of skin tones (including people with
  vitiligo) and by hijab wearers before release. A first draft is enough to
  build against.

### Task 4: Suggestion engine, one skin tone
- **Goal:** a function that takes outfit colours, a mood, and one skin tone,
  and returns a ranked list of hijab colours, each with a reason and a style tip.
  Uses colour-theory rules (complementary, analogous, neutral anchors) adjusted
  by mood.
- **Files:** `js/suggest.js`, `tests/suggest.test.js`.
- **Done when:** tests pass for cases such as "deep green outfit, soft mood,
  warm skin tone gives sensible colours and never a clashing neon", every
  suggestion has a reason, and the same input always gives the same output.
- **Why it matters:** this is the first real milestone. After this task the
  core of the app works with no photo and no screens.

### Task 5: Suggestion engine, two tones, balance and contrast, rejections
- **Goal:** extend the engine to accept two skin tones and a mode. In balance
  mode it favours colours that sit well against both tones and says so in the
  reason. In contrast mode it favours colours that stand out. It also drops any
  outfit and hijab pairing that was previously rejected.
- **Files:** `js/suggest.js`, `tests/suggest.test.js`.
- **Done when:** tests show that two tones change the ranking, that balance and
  contrast give different rankings for the same input, that rejected pairs never
  appear, and that if everything is rejected the engine returns an empty list
  rather than failing.

### Task 6: Storage
- **Goal:** save and load favourites, rejections, skin tone choice(s), and the
  mode in the browser's own storage. If storage is unavailable (private
  browsing, blocked, or full), the app keeps working and reports that nothing
  will be saved.
- **Files:** `js/storage.js`, `tests/storage.test.js`.
- **Done when:** tests pass for saving, loading, removing, undoing a rejection,
  and the storage-unavailable case (simulated). Tests also prove a pairing can
  never be both favourite and rejected: rejecting a favourite removes it from
  favourites, saving a rejected pairing removes it from rejected, and undoing a
  rejection does not make it a favourite.

### Task 7: Colour reader
- **Goal:** take an image and return a short list (about 3 to 5) of its main
  colours. Works on a shrunken copy for speed, groups similar colours, and
  ignores near-duplicates.
- **Files:** `js/colourReader.js`.
- **Done when:** on a set of sample photos (plain outfit, patterned outfit,
  busy background, dim light) the returned colours are roughly what a person
  would name. It will not be perfect, which is why the confirm step exists.

### Task 8: Photo checker and file types
- **Goal:** check brightness and sharpness and return a friendly tip when
  needed (including the lens-wipe suggestion, worded as a possibility, not a
  diagnosis). Accept JPEG, PNG, WebP, GIF, and HEIC (converted before reading).
  Reject other formats with a message listing the supported ones. Always allow
  "use this photo anyway".
- **Files:** `js/photoCheck.js`, `index.html` (library tag).
- **Done when:** a dark photo, a blurry photo, a good photo, a HEIC file, and a
  PDF each produce the right result.

### Task 9: Model preview
- **Goal:** draw the flat illustrated model from colours only: outfit colours,
  hijab colour, and one or two skin tones. Includes a simple two-tone face.
- **Files:** `js/model.js`.
- **Done when:** a test page shows the model correctly with very light, very
  dark, and mixed colours, and with one and two skin tones.

### Task 10: Screens, steps 1 to 3
- **Goal:** the upload step, the confirm-colours step (remove or adjust a
  swatch), and the vibe step (mood, 12-swatch skin tone grid, the two-tone
  option, and the balance or contrast switch).
- **Files:** `index.html`, `css/styles.css`, `js/app.js`.
- **Done when:** on a phone-sized screen you can upload a photo, fix the
  detected colours, and pick a mood and skin tone(s), and the choices are kept
  in the app's state.

### Task 11: Screen, step 4, and Favourites and Rejected pages
- **Goal:** the recommendation buttons with reason and style tip, the user's
  photo next to the model preview, the heart and cross on each button, the
  Favourites page, and the Rejected list with undo.
- **Files:** `index.html`, `css/styles.css`, `js/app.js`.
- **Done when:** tapping a suggestion updates the model, saving and rejecting
  persist after reloading the page, undoing a rejection brings the suggestion
  back, and rejecting a saved favourite asks for confirmation first.

### Task 12: Error states
- **Goal:** the messages and fallbacks from the spec: unusable photo (retry or
  pick colours by hand), everything rejected, storage unavailable.
- **Files:** `js/app.js`, `css/styles.css`.
- **Done when:** each error state can be triggered on purpose and shows the
  right message and options.

### Task 13: Phone testing and polish
- **Goal:** test the whole flow on real phones (including an iPhone for HEIC),
  fix layout and wording problems, and check readability and tap sizes.
- **Done when:** the full flow works on at least one Android and one iPhone
  browser with real outfit photos.

### Task 14: Publish
- **Goal:** put the static files on a free host so others can open the app.
- **Done when:** the app loads from a public link and works on a phone.

## Milestones

- **After Task 5:** the engine works end to end with no photo (the core idea
  is proven).
- **After Task 9:** every piece exists and has been checked on its own.
- **After Task 11:** the whole app works for the main path.
- **After Task 14:** version 1 is live.

## Risks to watch

- **Colour reading from photos is messy** (lighting, background, skin showing
  in the photo). The confirm step is the safety net, and Task 7 is where to
  expect the most tuning.
- **HEIC support** depends on a library and on browser behaviour. If it proves
  unreliable, the fallback is a clear message asking the user to share the
  photo as JPEG.
- **Suggestion quality** depends on the rules, which will need several rounds
  of adjusting once you see real results.
- **Skin tone swatches and style tips** need review by the people they
  represent (see Task 3).
