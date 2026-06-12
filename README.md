# The Adventures of Nicky J — Full AI Handoff README

This README is for any AI or developer continuing work on this website.

Read this before changing anything.

The most important lesson from this round of fixes is simple:

**Do not improvise UI that has already been designed as image assets.**

The mobile site especially has section-specific finished assets. If an asset already exists for a section, use that asset directly. Do not rebuild the same thing with CSS cards, generic tiles, placeholder boxes, or extra labels.

Also:

**Do not replace the illustrated hand-drawn window treatment with clean generic cream panels.**

Part of the look is the imperfect illustrated border/chrome effect. If the mockup shows a hand-drawn framed section, the implementation should use the hand-drawn section art, not a neat CSS box that only copies the color.

---

## 0. ASSET RESTRUCTURE — June 2026 (READ THIS FIRST)

The entire asset tree was professionally restructured. **Any path mentioned in the historical sections below that does not match this map refers to the OLD pre-restructure layout.** This section is the single source of truth.

### Current structure

```text
website/
├── index.html              ← desktop site
├── mobile.html             ← mobile site
├── README.md
├── css/
│   ├── style.css           ← desktop
│   └── mobile.css          ← mobile
├── js/
│   ├── app.js              ← desktop logic
│   ├── edit.js             ← desktop ?edit mode
│   └── mobile.js           ← mobile logic
├── data/
│   └── arrows.json         ← arrow styles list for edit mode
├── design-source/          ← NOT served. Affinity files, templates, thumbnail source photos
├── _archive/               ← NOT served. Unused/legacy files, safe to delete in Finder
├── fonts/  sounds/         ← empty, reserved
└── images/
    ├── arrows/             ← popup nav arrows (style-a-l/r.png, style-b-*, style-svg-*)
    ├── backgrounds/
    │   ├── desktop-miami.png
    │   └── mobile/mobile-bg-01.png … mobile-bg-04.png
    ├── thumbnails/         ← desktop gallery thumb composites with window frame
    │                          AND title text baked in (portrait, street, landscape,
    │                          wedding; liminal is menu-only). No HTML title spans on top.
    ├── galleries/          ← THE PHOTOS. naming: <gallery>-NN.jpg, zero-padded from 01
    │   ├── street/street-01.jpg …
    │   ├── portrait/  liminal/  landscape/  wedding/   (travel/ is retired — superseded by landscape/)
    │   ├── portfolio/portfolio-01.jpg …   ← desktop preview/legacy set
    │   └── mobile-covers/cover-<gallery>.png ← mobile galleries-overview card art,
    │       named after the gallery id (cover-street.png, cover-landscape.png, …).
    │       Adding a gallery to mobile.js requires a matching cover file.
    │       (old cover-01..03.png are unused leftovers, safe to delete)
    └── ui/
        ├── desktop/
        │   ├── popup-window.png        ← popup frame art
        │   ├── dock-platform.png
        │   └── dock/about.png portfolio.png services.png prices.png contact.png instagram.png
        └── mobile/
            ├── hero/hero-window.png (+ -trim)         ← finished hero window art
            ├── quick-links/about|galleries|services|contact.png
            ├── categories/street|wedding|portrait|travel|design|websites|video.png
            │   └── section-window.png / section-window-2.png (+ -trim) ← illustrated section shells
            ├── dock/dock-bar.png (+ -trim), home|camera|palmtree|menu|price-tag.png (+ -clean)
            └── gallery-frame-square.png
```

### Photo naming convention (CHANGED)

- OLD: `images/street/image 1.jpg` (space, no padding)
- NEW: `images/galleries/street/street-01.jpg` (kebab-case, zero-padded)
- The JS loaders in `app.js`, `mobile.js`, `edit.js` probe `<base><NN>.jpg` with `String(n).padStart(2,'0')`
- When adding photos: continue the sequence (`street-10.jpg`, `street-11.jpg`, …). Numbers above 09 are just two digits, no change needed. Max probed: 30 per gallery.

### Old → new mapping (key moves)

| Old | New |
|---|---|
| `images/<gallery>/image N.jpg` | `images/galleries/<gallery>/<gallery>-NN.jpg` |
| `images/portfolio/` | `images/galleries/portfolio/` |
| `images/galleries/Phone/image-0N.png` | `images/galleries/mobile-covers/cover-0N.png` |
| `images/Thumbnail/*.png` | `images/thumbnails/*.png` |
| `images/background/backgroundmiamiimage.png` | `images/backgrounds/desktop-miami.png` |
| `images/background/Phone/MobilePhone-Background0000N.png` | `images/backgrounds/mobile/mobile-bg-0N.png` |
| `images/icons/pop-up-window.png` | `images/ui/desktop/popup-window.png` |
| `images/icons/icon-platform.png` | `images/ui/desktop/dock-platform.png` |
| `images/icons/{id-icon,polaroidimages…,boxofitems…,Price-tag…,mail…,polaroid-camera…}.png` | `images/ui/desktop/dock/{about,portfolio,services,prices,contact,instagram}.png` |
| `images/icons/phone/top-hero/top-window*.png` | `images/ui/mobile/hero/hero-window*.png` |
| `images/icons/phone/box-1/*` | `images/ui/mobile/quick-links/{about,galleries,services,contact}.png` |
| `images/icons/phone/box-2/<Category>.png` | `images/ui/mobile/categories/<category>.png` (lowercase) |
| `images/icons/phone/box-2/Item-window*.png` | `images/ui/mobile/categories/section-window*.png` |
| `images/icons/phone/dock/Bottom-Dock-bar*` | `images/ui/mobile/dock/dock-bar*` |
| `images/icons/phone/dock/Price-tag-1-icon*` | `images/ui/mobile/dock/price-tag*` |
| `images/icons/phone/Image Gallery Frame Square.png` | `images/ui/mobile/gallery-frame-square.png` |

### What went to `_archive/`

Unused/legacy files, preserving their original subpaths: the old `Original Index/`, `css/mobile_test.css`, `css/test123.txt`, old arrow PNGs/SVGs from `images/icons/`, the unused `Image Gallery Frame Rectangle.png`, unused box-1 icons, the dangerous `topwindow-background.png` (raw sunset that kept getting misused as the hero), duplicate `Item-window` copies from top-hero, and all `.DS_Store` files (in `_archive/macos-junk/`). Delete the folder in Finder whenever you're ready. The old (now empty) folders `images/street`, `images/icons`, etc. could not be removed by the AI sandbox — delete them in Finder too.

### Rules going forward

1. Photos: `<gallery>-NN.jpg`, zero-padded, sequential
2. All filenames and folders: lowercase kebab-case, no spaces
3. UI art lives under `images/ui/<platform>/<section>/`, named by FUNCTION (about.png) not by art description (polaroidimages-icon-version4.png)
4. `-trim` / `-clean` suffixes are derived files used by code; the suffix-less file is the source art
5. Design source files (.af etc.) go in `design-source/`, never in `images/`
6. If you move or rename an asset, update every reference in: `index.html`, `mobile.html`, `css/style.css`, `css/mobile.css`, `js/app.js`, `js/mobile.js`, `js/edit.js` — then update this README

---

### Per-gallery desktop popup frames (June 2026)

- Each desktop gallery has its own popup window frame with the TITLE BAKED INTO the art (CSS text never aligned well): `images/ui/desktop/<gallery>-popup-window.png`
- `galleryConfig` entries in `js/app.js` carry a `frame:` path; `applyPopupFrame()` swaps the frame and hides the CSS `.popup-title` when a baked frame is used
- the generic `popup-window.png` remains the fallback (About popup, portfolio preview)
- desktop landing grid shows ONLY: Wedding, Liminal Spaces, Portrait, Landscape. Street (and everything else) stays reachable via the Content menu
- mobile travel→landscape rename is complete, including tile art `images/ui/mobile/categories/landscape.png`
- `images/thumbnails/landscape.png` is a generated composite (window-template + landscape-01) — replace with a hand-made export whenever desired
- photo extensions must be lowercase `.jpg` — uppercase `.JPG` breaks on case-sensitive web servers (two portrait files were fixed)

## 1. Project Summary

This project contains:

1. A desktop/main site using `index.html`, `css/style.css`, and `js/app.js`
2. A separate mobile site using `mobile.html`, `css/mobile.css`, and `js/mobile.js`

The desktop and mobile experiences are related, but they are not built the same way.

- Desktop is a staged retro desktop-style site with dock icons, gallery popups, and section scrolling.
- Mobile is a phone UI mockup experience built from prepared phone assets and simple SPA-style navigation.

This is a static site.

- No framework
- No build step
- No backend
- Plain HTML, CSS, and JavaScript

---

## 2. Files That Matter Most

### Desktop

- `index.html`
- `css/style.css`
- `js/app.js`
- `js/edit.js`

### Mobile

- `mobile.html`
- `css/mobile.css`
- `js/mobile.js`

### Important asset folders

- `images/background/`
- `images/background/Phone/`
- `images/icons/`
- `images/icons/phone/`
- `images/galleries/Phone/`
- `images/portfolio/`
- `images/travel/`
- other image galleries such as `images/street/`, `images/portrait/`, `images/wedding/`

### Fast file structure map

Use this as the quick orientation map before editing.

```text
website/
├── index.html
├── mobile.html
├── README.md
├── css/
│   ├── style.css
│   └── mobile.css
├── js/
│   ├── app.js
│   ├── edit.js
│   └── mobile.js
└── images/
    ├── background/
    │   └── Phone/
    │       ├── MobilePhone-Background00001.png
    │       ├── MobilePhone-Background00002.png
    │       ├── MobilePhone-Background00003.png
    │       └── MobilePhone-Background00004.png
    ├── galleries/
    │   └── Phone/
    │       ├── image-01.png
    │       ├── image-02.png
    │       └── image-03.png
    ├── icons/
    │   └── phone/
    │       ├── top-hero/
    │       ├── box-1/
    │       ├── box-2/
    │       ├── dock/
    │       ├── Image Gallery Frame Rectangle.png
    │       └── Image Gallery Frame Square.png
    ├── portfolio/
    ├── street/
    ├── portrait/
    ├── wedding/
    └── travel/
```

---

## 3. What We Fixed In This Round

This section is the high-level changelog for the work that was completed.

### Mobile naming and asset cleanup

We cleaned up messy phone asset folder names and updated the code to match.

Renames completed:

- `images/portfolio/Phone` → `images/galleries/Phone`
- `images/icons/phone/top-hero ` → `images/icons/phone/top-hero`
- `images/icons/phone/box 1` → `images/icons/phone/box-1`
- `images/icons/phone/box 2` → `images/icons/phone/box-2`

Why this matters:

- `top-hero ` had a trailing space, which is dangerous and easy to break
- `box 1` and `box 2` were hard to reference consistently
- `portfolio/Phone` was the wrong concept for those mobile assets because they are actually used for galleries

### Mobile gallery flow bug fix

There was a logic issue on mobile:

- tapping a home category tile such as Street or Wedding briefly opened the Galleries overview
- then it opened the target gallery

That made the app feel broken.

This was fixed so that:

- tapping a category tile on the **home screen** opens that gallery **directly**
- tapping the main **Galleries** entry still opens the galleries overview page
- back behavior now depends on where the gallery was opened from

New back behavior:

- opened from home category tile → back returns to `home`
- opened from galleries overview → back returns to `galleries`

This is controlled in `js/mobile.js` with `galleryBackScreen` and `openGallery(id, { backTo: ... })`.

### Mobile visual asset usage fix

The mobile category section was incorrectly rebuilt using an extra CSS card/tile structure.

That was wrong.

The user had already created finished tile graphics like:

- `images/icons/phone/box-2/Street.png`
- `images/icons/phone/box-2/Portrait.png`
- `images/icons/phone/box-2/Travel.png`
- `images/icons/phone/box-2/Wedding.png`

These tile images already contain:

- the frame
- the icon/art
- the text
- the pink underline/mark

So the fix was:

- stop wrapping those in newly generated tile cards
- render the prepared tile image directly

There is a second part to this rule:

- do not place those tiles on top of overly clean generic cream containers if the section is supposed to have hand-drawn illustrated window art
- matching the fill color is not enough
- the border/chrome treatment is part of the design language

### Box-1 and Box-2 implementation warning

This needs to be extremely clear for the next AI:

- `box-1` and `box-2` are not just loose icon folders
- they are part of the intended section design system for the mobile home page

What went wrong in this round:

- the code did use `box-1` icon files and `box-2` tile files
- but the section structure was still being drawn with generic cream CSS panels
- that means the implementation was using some of the assets, but **not using the full section art language**

Why this matters:

- the user’s mockup has a hand-drawn illustrated framed look
- a plain cream CSS box does not match that look
- using the correct tile PNGs alone is not enough if the section container itself looks too clean

Rule for future AI work:

- do not assume “using the icons” means the section is implemented correctly
- check whether the section container/window art is also supposed to come from the asset folders
- if the mockup shows an illustrated section shell, use the illustrated section shell

### Mobile background fix

The mobile shell had an incorrect pink dotted look that did not match the intended design.

That was replaced so the app shell can use the prepared phone backgrounds from:

- `images/background/Phone/`

Current mobile background behavior:

- `#mobile-app` uses `images/background/Phone/MobilePhone-Background00002.png`
- the old dotted overlay on `#mobile-app::before` is disabled
- gallery/gallery-overview background cycling still uses the other phone background images

### Travel gallery hookup

There was no separate mobile icon asset for Liminal Spaces in the home category row.

The user explicitly said to link Travel to the Travel gallery instead.

Current mobile behavior:

- the home category tile uses `box-2/Travel.png`
- that opens the mobile gallery at `images/travel/image 1.jpg`, `image 2.jpg`, etc.

This is intentional.

Do not change it back unless the user provides a dedicated Liminal Spaces phone tile and asks for it.

---

## 3b. Mobile Design-Match Round (June 2026)

A dedicated pass was done to make `mobile.html` match the approved mockup.

### Hero now uses the FINISHED hero window art

- `images/icons/phone/top-hero/top-window.png` is the complete hand-drawn hero window: frame, cream text panel on the left, sunset on the right, and carousel dots are all baked in
- `topwindow-background.png` is ONLY the raw sunset. It must never be used as the hero background — that was the bug that made hero text unreadable
- The old `syncHeroSlide()` override in `js/mobile.js` that forced `topwindow-background.png` was neutralized. Hero art is set in CSS only
- Hero text is positioned over the cream left panel of the art (percent-based, scales on all phones)

### Trimmed structural assets (new files)

The structural art had large transparent padding, which made precise CSS sizing impossible (and caused the dock distortion). Auto-trimmed copies were generated:

- `images/icons/phone/top-hero/top-window-trim.png` (1327×625)
- `images/icons/phone/box-2/Item-window-trim.png` (1484×861)
- `images/icons/phone/box-2/Item-window-2-trim.png` (1388×916)
- `images/icons/phone/dock/Bottom-Dock-bar-trim.png` (1405×284)

Rules:

- the `-trim` versions are what CSS references; the originals remain untouched as source art
- if an original is re-exported, regenerate its `-trim` copy (crop to alpha bounding box)

### Item-window shells are now real

- `mobile.html` wraps the quick-links and category sections in `.m-window` containers
- `.m-window` renders `Item-window-trim.png` / `Item-window-2-trim.png` via CSS `border-image` (slice + fill), so the hand-drawn border survives at any section height
- the old generic cream CSS panel rules (`.m-home-content > .m-quick-grid` etc.) were removed

### Dock fixed (second pass)

- the dock icon PNGs (`home`, `camera`, `palmtree`, `menu`, `Price-tag-1-icon`) had a FAKE checkerboard "transparency" baked into the pixels — that is why they rendered as white squares on the bar
- cleaned `-clean.png` copies were generated (flood-fill from edges, real alpha, trimmed); `mobile.html` references the `-clean` versions. Never use the originals in code until re-exported with real transparency
- `palmtree-clean.png` already contains the pink circle — do not draw another circle behind it in CSS
- bar is `Bottom-Dock-bar-trim.png`, flush full width, height locked to the art's native 4.95:1 ratio via `--nav-h: clamp(64px, calc(min(100vw,480px)/4.95), 97px)`
- icons ~28px, labels 9.5px inside the bar, thin vertical dividers between items, pink underline on the active item, palm raised above the bar

### Background + type scale

- home background is the soft lavender→cream→pink gradient with a faint white grid (mockup language), not the old saturated hot-pink
- `#mobile-app::before` is the grid overlay now (the old pink dotted overlay stays gone)
- micro-fonts (6.5–8.5px) were raised to readable sizes (9–11px, clamp() in the hero)
- `Caveat` font added for the script "Welcome"
- `100dvh` support; on screens ≥600px wide the app is capped at 480px and centred (nav/sheets switched from `fixed` to `absolute` so the cap works)

---

## 4. Current Mobile Asset Map

This is one of the most important sections in the README.

The phone assets are now organized by section. Future AIs should use this structure instead of guessing.

### `images/icons/phone/top-hero/`

Use this folder for the top hero section on the mobile home screen.

Current key assets:

- `top-window.png` — the FINISHED hero window (frame + cream panel + sunset + dots). THIS is the hero art
- `top-window-trim.png` — alpha-trimmed copy of the above; this is what CSS references
- `topwindow-background.png` — raw sunset only. Never use as the hero

Rule:

- the hero must use `top-window-trim.png` directly
- do not recreate the hero frame or window in CSS, and do not substitute the raw sunset

### `images/icons/phone/box-1/`

Use this folder for the first boxed section below the hero on mobile.

This is the quick-links/highlights section.

Current usage in `mobile.html`:

- About Me icon
- Galleries icon
- Services icon
- Contact icon

These are the four small shortcut items directly under the hero.

Important warning:

- in the current implementation, the icons are being used
- but the broader section still risks looking too much like a generic CSS cream panel instead of a hand-drawn illustrated section
- future AI work should check whether this section also needs a dedicated section-shell asset rather than only icon placement

### `images/icons/phone/box-2/`

Use this folder for the category section on mobile.

These are the finished category tiles.

This folder also contains section window assets:

- `Item-window.png`
- `Item-window-2.png`

Examples:

- `Street.png`
- `Portrait.png`
- `Travel.png`
- `Wedding.png`
- `Design.png`
- `Websites.png`
- `Video.png`

Rule:

- use these final tile PNGs directly
- do not place them inside another visual tile shell
- do not add duplicate text under them
- do not recreate the underline with CSS if the image already includes it
- when the section itself is meant to look hand-drawn, use the matching illustrated window/container art instead of a plain cream CSS block

Important warning:

- in the current implementation, the tile PNGs are being used
- but `box-2` was still not fully matching the design because the outer section treatment was still too clean and CSS-generated
- the next AI should treat `Item-window.png` and `Item-window-2.png` as likely structural section assets, not as optional extras

### `images/icons/phone/dock/`

Use this folder for the bottom dock/navigation on mobile.

Current assets include:

- `Bottom-Dock-bar.png` (source) / `Bottom-Dock-bar-trim.png` (used by CSS)
- `home.png` / `home-clean.png`
- `camera.png` / `camera-clean.png`
- `palmtree.png` / `palmtree-clean.png` (includes the pink circle)
- `Price-tag-1-icon.png` / `Price-tag-1-icon-clean.png`
- `menu.png` / `menu-clean.png`

The `-clean`/`-trim` files are the ones code must reference: the originals have baked-in checkerboard backgrounds or transparent padding.

Rule:

- the dock background should come from this folder
- the dock icons should also come from this folder
- do not approximate the dock with a generic rounded bar if the real art exists

### `images/galleries/Phone/`

This folder contains the phone-specific gallery overview card art.

Current assets:

- `image-01.png`
- `image-02.png`
- `image-03.png`

These are not the full photo galleries themselves.

They are used as visual art for the mobile Galleries overview screen.

### `images/background/Phone/`

This folder contains prepared mobile/phone background images.

Current assets:

- `MobilePhone-Background00001.png`
- `MobilePhone-Background00002.png`
- `MobilePhone-Background00003.png`
- `MobilePhone-Background00004.png`

Rule:

- if the mobile screen needs a full-shell background, start here first
- do not default to a flat color or dotted overlay if these backgrounds match the design

---

## 5. Current Mobile Code Rules

### Main mobile files

- `mobile.html`
- `css/mobile.css`
- `js/mobile.js`

### How the mobile app works

The mobile site behaves like a lightweight single-page app with three screens:

- `home`
- `galleries`
- `gallery`

Screen switching is managed in `js/mobile.js`.

### Important mobile logic

#### Home category tiles

Defined in `HOME_CATEGORY_TILES` in `js/mobile.js`.

Current gallery tiles:

- `street`
- `wedding`
- `portrait`
- `landscape` (tile art still reads "Travel" until new art is made)

Current non-gallery placeholders/stubs:

- `design`
- `websites`
- `video`

Important:

- the category tile images are direct PNG assets from `box-2`
- gallery tiles call `openGallery(tile.id, { backTo: 'home' })`
- stub tiles are not active galleries

#### Galleries overview

The galleries overview screen is populated in `buildGalleryCards()`.

It currently uses:

- `images/galleries/Phone/image-01.png`
- `images/galleries/Phone/image-02.png`
- `images/galleries/Phone/image-03.png`

When a gallery is opened from this screen, it uses:

- `openGallery(gallery.id, { backTo: 'galleries' })`

#### Individual gallery screen

Each gallery loads images by probing sequential filenames such as:

- `images/street/image 1.jpg`
- `images/street/image 2.jpg`
- etc.

Travel currently uses:

- `images/travel/image 1.jpg`
- `images/travel/image 2.jpg`
- etc.

This convention matters.

If a new gallery is added, follow the same filename pattern unless the user explicitly changes the convention.

### Mobile hero

The mobile hero now uses the prepared hero art directly.

Current source:

- `images/icons/phone/top-hero/topwindow-background.png`

Important:

- the old hidden `top-window.png` reference was removed from `mobile.html`
- the hero is now controlled visually through CSS/background usage

---

## 6. Current Desktop Rules

Desktop has not been rebuilt to match the mobile phone asset structure.

Do not assume that a mobile rename should automatically be copied to desktop.

### Desktop gallery naming is still partly legacy

Desktop code still uses some internal legacy naming such as `portfolio`.

Examples:

- `data-action="portfolio"` in `index.html`
- `popup-portfolio` in `index.html`
- `openGallery('portfolio')` in `js/app.js`
- `galleryConfig.portfolio.base = 'images/portfolio/image '`

This is a known naming mismatch:

- user-facing language is now more aligned with **Galleries**
- desktop code still contains some older internal `portfolio` names

Important rule:

- do not blindly rename all desktop `portfolio` references unless you are prepared to update all dependent desktop logic and verify the popup/gallery behavior

For now:

- desktop `images/portfolio/` still exists and is still a real content source
- mobile `images/galleries/Phone/` is a different asset set for phone gallery overview art

These are not the same thing.

### Desktop gallery set

Desktop currently has gallery entries such as:

- `street`
- `portrait`
- `liminal`
- `wedding`
- plus legacy `portfolio`

That logic lives in `js/app.js`.

If desktop gallery naming is cleaned later, that should be treated as a separate desktop refactor, not as part of the mobile asset cleanup.

---

## 6b. Desktop Gallery Maximize/Minimize Animation (June 2026 fix)

The desktop gallery windows open like a maximizing OS window and close back down. The close used to "go haywire" — half big, half small, arrows popping in and out.

Root cause:

- `animatePopupClose()` cloned the ENTIRE `.popup-window` (arrows, close button, title, content) and animated the clone's width/height down
- the popup's children are positioned with fixed pixel offsets sized for the 720×406 window, so they do not scale with the box — that produced the distorted half-big/half-small look
- the cloned arrows rode along and vanished abruptly

Current behavior (do not regress this):

- OPEN: thumb art morphs up to the popup rect → real popup revealed → arrows fade in (`.popup-window.arrows-in`, CSS transition at the end of `style.css`)
- CLOSE: arrows fade out first (~200ms) → popup swaps for a morph of the THUMB art (`gallery-morph-thumb`) which shrinks back to the thumb slot → overlay closes, thumb restored
- `galleryState.closing` guards against double-close / reopen mid-animation

Rule: never morph a clone of the maximized popup window. Always morph the thumb-window art in both directions.

---

## 6c. Edit Mode (?edit) Crash Fix (June 2026)

Edit mode (`index.html?edit`, powered by `js/edit.js`) was completely broken: the panel rendered but no control responded.

Root cause:

- `refreshTitleControls()` was called near the top of the script, BEFORE the `const` panel references it uses (`titleSelEl`, `titleXSl`, ...) were declared
- consts are in the temporal dead zone at that point, so the call threw a `ReferenceError` that aborted the whole IIFE — every slider/picker/save handler after that line never bound

Fix:

- the early call was removed; `refreshTitleControls()` now runs right after the refs and the function definition
- rule: in `edit.js`, never call functions that touch panel refs before the "Panel refs" block

Related: `openGallery()` without a source thumb (edit-mode "Open Portfolio Preview", legacy portfolio action) now reveals the popup directly and fades the arrows in, so the arrow picker preview works with the new arrow fade behavior.

---

## 7. Logic Issues We Hit And How They Were Solved

This section is here so future AIs do not repeat the same mistakes.

### Issue 1: Rebuilding designed assets instead of using them

Problem:

- mobile sections were being approximated with generic CSS panels and nested tiles
- this caused the design to drift from the provided mockups

Fix:

- use the correct prepared asset folder for each section
- render those assets directly where appropriate

Rule:

- inspect the asset folders before inventing new structure

### Issue 2: Wrong concept for phone gallery assets

Problem:

- mobile phone gallery assets were sitting under `images/portfolio/Phone`
- that confused the meaning and clashed with the updated Galleries naming

Fix:

- rename to `images/galleries/Phone`
- update code references

### Issue 3: Broken-feeling double navigation

Problem:

- tapping a category from the home screen appeared to open Galleries and then the final gallery immediately after

Fix:

- bypass the overview when the category originates from home
- track the origin with `galleryBackScreen`

### Issue 4: Back button needed context-sensitive behavior

Problem:

- back could not behave correctly if the gallery screen did not know where it came from

Fix:

- set `galleryBackScreen = 'home'` when a gallery is opened from home
- set `galleryBackScreen = 'galleries'` when a gallery is opened from the galleries overview

### Issue 5: Trailing spaces and spaced folder names

Problem:

- `top-hero ` had a trailing space
- `box 1` and `box 2` were awkward and easy to mistype

Fix:

- rename them to clean paths
- update every matching code reference

---

## 8. How Future AIs Should Approach Updates

Follow these rules in order.

### Rule 1: Inspect assets before editing layout

Before changing HTML/CSS/JS, inspect the relevant asset folders.

For mobile, always check:

- `images/icons/phone/top-hero/`
- `images/icons/phone/box-1/`
- `images/icons/phone/box-2/`
- `images/icons/phone/dock/`
- `images/background/Phone/`
- `images/galleries/Phone/`

Do not assume the user forgot to provide assets.

### Rule 2: Use finished art directly if it already exists

If an image already includes:

- a frame
- text
- an underline
- a background panel
- a window treatment

then use that image directly.

Do not wrap it in another fake version of the same thing.

This includes the hand-drawn edge quality.

If the mockup section looks illustrated, slightly imperfect, or sketched around the edges, a plain CSS cream card is not an acceptable substitute even if the color is similar.

### Rule 3: Decide whether a change is desktop, mobile, or both

Do not assume changes apply everywhere.

Questions to answer before editing:

1. Is this change only for `mobile.html` / `mobile.css` / `mobile.js`?
2. Is this change only for `index.html` / `style.css` / `app.js`?
3. Is there any shared asset folder that affects both?

### Rule 4: Respect the gallery file conventions

Gallery images are loaded by predictable filename patterns.

Examples:

- `images/travel/image 1.jpg`
- `images/travel/image 2.jpg`
- `images/street/image 1.jpg`

If you change a gallery path, update the corresponding JS config.

### Rule 5: Be careful with legacy desktop naming

Desktop still has internal `portfolio` naming in the code.

This is not automatically wrong.

It is only wrong if the user explicitly wants the desktop internals renamed too.

If you rename desktop internals:

- update `index.html`
- update `js/app.js`
- update `js/edit.js`
- verify popup and gallery triggers

### Rule 6: Keep README updated when asset structure changes

If folders are renamed, reorganized, or repurposed:

- update this README immediately
- explain what changed
- explain whether the change affects mobile, desktop, or both

---

## 9. Recommended QA Checklist After Any Future Edit

### Mobile visual QA

1. Hero uses the correct prepared top hero art
2. Quick links use `box-1` assets
3. Category section uses `box-2` tile PNGs directly
4. Bottom dock uses the real dock art and real dock icons
5. No generic pink dotted fallback appears unless intentionally chosen

### Mobile logic QA

1. Home category tile opens the target gallery directly
2. Galleries icon opens the galleries overview
3. View All opens the galleries overview
4. Back from a home-opened gallery returns to home
5. Back from an overview-opened gallery returns to galleries
6. Travel opens the Travel gallery

### Desktop QA

1. Desktop dock still works
2. Desktop galleries section still opens the correct popup galleries
3. Legacy `portfolio`-named internals still resolve correctly

---

## 10. Current Recommendation On Redesigning Assets

At the end of this round, the recommendation was:

- **do not redesign top hero, box-1, or box-2 yet**

The main problem was not missing assets.

The main problem was:

- wrong asset selection
- extra invented UI layers
- bad path naming
- incorrect navigation flow

Only redesign those sections if:

- the user decides the source asset dimensions themselves are wrong
- or a live preview still shows cropping/fit problems after using the correct assets

In other words:

- fix usage first
- redesign assets second only if truly necessary

---

## 11. Fast Reference For The Next AI

If you only remember five things, remember these:

1. Mobile uses prepared phone assets by section. Do not rebuild them with CSS.
2. `box-2` category tiles are finished images, not raw icon ingredients.
3. Home category taps open galleries directly and back behavior is context-sensitive.
4. `images/galleries/Phone/` is for mobile gallery overview art, not desktop gallery photos.
5. Desktop still contains internal `portfolio` naming, so do not “cleanup rename” that without a separate verified pass.
