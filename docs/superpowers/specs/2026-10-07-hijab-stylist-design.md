# Hijab Stylist: Version 1 Design Spec

Date: 2026-10-07
Status: Draft, awaiting review

## 1. Purpose

Many Muslim hijab wearers find it hard to choose a hijab colour and style
for an outfit, and regret the choice later. This app helps by taking a photo
of the outfit and suggesting matching hijab colours, with a reason for each
and a style tip, so the user can compare options before committing.

**Success looks like:** a user photographs their outfit, taps through a few
suggestions, picks one they feel good about, and regrets their choice less.

## 2. Scope of version 1

### In scope
- Single-page web app that works well in a phone browser
- Photo upload of the outfit (JPEG, PNG, WebP, GIF, and HEIC)
- Photo quality checks (brightness and sharpness) with friendly tips
- Colour reading from the photo, with a confirm/correct step
- Mood choice and skin tone choice (swatches, no typing), including a
  "two tones or patchy skin" option (see section 12)
- Recommendation buttons with a reason and a style tip for each
- Preview: the user's own outfit photo shown beside a simple illustrated model.
  The model is painted with the confirmed outfit colours, and tapping a hijab
  colour updates the model's hijab
- Save (favourite), reject, and undo reject
- Everything runs in the browser: no server, no accounts, no API keys

### Out of scope (later)
- AI vision for patterns and garment types
- Recolouring the hijab directly on the user's own photo (needs image
  segmentation)
- AI-generated try-on images (needs a server, an API, and sends photos to a
  third party)
- Accounts and syncing across devices
- Occasion planning and shopping modes
- Learning a user's preferences across outfits
- Selfie-based skin tone detection

## 3. Users and assumptions

- **Users:** Muslim hijab wearers in general, not one person or one culture.
  Styles and modesty preferences vary, so the app suggests and the user decides.
- **Moment of use:** getting dressed at home.
- **Builder:** comfortable with HTML, CSS, and Python; knows the basics of
  JavaScript; no API experience. The design avoids servers and APIs to keep
  the build simple (one static page, nothing to keep running). Python is
  reserved for a possible later server when AI vision is added.

## 4. User flow

One page, four steps shown in order, plus a Favourites page.

1. **Upload.** The user takes or picks a photo of their outfit.
2. **Confirm colours.** The app shows the main colours it found as tappable
   swatches. The user can remove a wrong one (for example a wall) or adjust one.
3. **Set the vibe.** The user taps a mood (soft, bold, professional, playful)
   and a skin tone from a swatch grid (or the two-tone option). The skin tone
   choice is remembered for next time.
4. **Pick a recommendation.** A row of hijab colour buttons appears. The
   screen shows the user's outfit photo next to an illustrated model wearing
   the confirmed outfit colours. Tapping a button recolours the model's hijab
   and shows a short reason
   ("a warm beige balances the deep green of your outfit"), and a style tip
   (including whether a scarf might suit better than a hijab). Each button has
   a heart (save) and a cross (reject). The user compares and chooses.

The user can return to step 3 to change the mood without re-uploading the photo.

## 5. Components

Each component has one job and a clear interface.

| Component | Does | Input | Output | Depends on |
|---|---|---|---|---|
| Photo checker | Judges whether a photo is usable | Image | Pass, or a tip (too dark, too bright, blurry) | none |
| Colour reader | Finds dominant colours | Image | Short list of colours | none |
| Suggestion engine | Picks hijab colours, reasons, style tips | Outfit colours, mood, skin tone(s), balance or contrast mode, rejected pairs | Ranked list of suggestions | none |
| Model preview | Draws the illustrated model from colours | Outfit colours, hijab colour | Image on screen | none |
| Screens | Show data and collect taps | Data from the above | User choices | all of the above |
| Storage | Remembers things on the device | Favourites, rejections, skin tone | Saved data | browser storage |

**The suggestion engine is deliberately isolated.** It knows nothing about
photos or screens. Version 1 uses colour-theory rules (complementary,
analogous, neutral anchors) adjusted by mood and skin tone. Because its input
and output are fixed, an AI model can later be swapped in or added without
rewriting the rest of the app.

## 6. Data flow

photo → photo checker → colour reader → (user corrects) → suggestion engine →
screens → storage

Stored on the user's device only:
- **Favourites:** outfit colours, hijab colour, reason, style tip
- **Rejections:** outfit and hijab colour pairs the user dismissed
- **Skin tone choice** (one or two tones) and the balance or contrast mode

## 7. Photo handling

- **Brightness check:** if too dark or too bright, suggest better lighting
  (for example, turn on a light or move near a window).
- **Sharpness check:** if blurry or hazy, suggest retaking, mentioning that a
  smudged camera lens is a common cause. The app cannot actually tell a dirty
  lens from shake or bad focus, so this is a tip, not a diagnosis.
- **Override:** the user can always choose "use this photo anyway".
- **File types:** JPEG, PNG, WebP, and GIF are read natively by the browser.
  HEIC (the iPhone default) needs a small conversion step and is included in
  version 1. Other formats get a message listing the supported ones.

## 8. Rejection behaviour

A rejected outfit and hijab colour pair is remembered and never suggested
again. A "Rejected" list lets the user undo any rejection. Rejection applies
to the specific pairing, not to the colour in general.

**A pairing can never be both a favourite and rejected.** The most recent
action wins, and the storage component enforces this so no screen can break
it:
- Rejecting a pairing that is saved as a favourite removes it from Favourites.
- Saving a pairing that is rejected removes it from Rejected.
- Undoing a rejection returns the pairing to neutral (it is not made a
  favourite).
Because rejecting a favourite removes it, the screen asks for a quick
confirmation first, so a mis-tap does not silently lose something the user
liked.

## 9. Error handling

- **Unusable photo:** plain explanation, option to retry, or to pick colours
  by hand from a palette.
- **Wrong colours detected:** handled by the confirm step.
- **Everything rejected for this outfit:** message explaining this, with
  options to restore rejected suggestions or try a different mood.
- **Storage unavailable or cleared:** the app still works, and tells the user
  that favourites will not be saved. Clearing browser data or changing phones
  loses saved data; this is a known limit of version 1.

## 10. Testing

- **Suggestion engine:** plain examples with no photo needed, such as "deep
  green outfit, soft mood, warm skin tone never produces a clashing neon".
  Also tested with two tones: balance mode should favour colours that work
  with both, and contrast mode should change the ranking.
- **Photo checker and colour reader:** tried on real photos in varied lighting
  (dim, bright, blurry, busy background).
- **Model preview:** checked with a range of outfit, hijab, and skin tone
  colours (including very light and very dark) to make sure the figure stays
  readable.
- **Whole flow:** tested by hand on a phone browser, including an iPhone for HEIC.

## 11. Model preview

The preview pairs the user's photo with a flat, illustrated figure (drawn with
simple shapes, no image files). The figure's outfit uses the confirmed outfit
colours; its hijab uses the selected suggestion, and its skin uses the chosen
tone (or a simple two-tone face when the user picked two tones). It shows how the colours sit together, not a realistic fit or drape.
The preview component takes only colours as input, so a later upgrade (real
recolouring on the photo, or an AI try-on) can replace it without touching the
rest of the app.

## 12. Skin tone choice

- **Swatch grid:** about 12 swatches from lighter to deeper, with cooler,
  neutral, and warmer undertones. The app notes that screens show colour
  differently, so swatches are approximate.
- **No automatic detection.** The user always picks; the app never labels
  someone's skin from a photo.
- **"Two tones or patchy skin" option:** covers vitiligo, melasma, and other
  uneven pigmentation without requiring anyone to name a condition. The user
  picks two swatches (a main tone and a second tone). The app does not
  recommend a swatch for them.
- **Balance mode (default):** with two tones, the suggestion engine checks each
  hijab colour against both tones and favours colours that sit well with both.
  The reason text says so, for example "this beige sits well against both of
  your skin tones".
- **Contrast mode:** a switch labelled "highlight contrast" changes the
  suggestions to favour colours that stand out against the tones, for users who
  prefer that look. Neither mode is treated as correct; the user chooses.
- **Model preview:** shows a simple two-tone face when two tones are chosen.

## 13. Open questions

- The exact list of moods and skin tone swatches (starting set: four moods,
  twelve skin tone swatches) can be refined while building. The swatch set
  should be reviewed by people with a range of skin tones, including people
  with vitiligo, so it feels accurate and respectful.
- The style tips need a starter library of draping styles; its content should
  be reviewed by hijab wearers so the advice is accurate and culturally fair.
