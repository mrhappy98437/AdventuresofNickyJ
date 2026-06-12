/* ═══════════════════════════════════════════════════════
   The Adventures of Nicky J — Edit Mode  v2
   ═══════════════════════════════════════════════════════
   Add ?edit to the URL to activate.

   Sections (collapsible accordion)
   ─────────────────────────────────────────────────────
   GALLERY
     • Portfolio photo slots (8 images)
     • Arrow picker — left & right independently
       (filenames loaded from data/arrows.json)
     • Gallery popup — scale first, reset button

   DOCK
     • Shelf height slider
     • Multi-select icons (click / shift+click / rubber-band)
     • Y position + size sliders for selected icons
     • Level All, Select All

   ABOUT ME
     • Click any paragraph in popup to edit inline

   PAGE LINKS
     • Assign URLs / mailto to any menu item

   SAVE
     • Removes edit-mode DOM entirely before capture
     • Downloads clean index.html
     • Persists to localStorage

   RESET
     • Clears localStorage, reloads
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!window.location.search.includes('edit')) return;

  /* ── Constants ──────────────────────────────────────── */
  const STORAGE_KEY  = 'njay_layout';
  const IMG_PATH     = 'images/galleries/portfolio/';
  const ARROW_PATH   = 'images/arrows/';
  const ICON_ACTIONS = ['about','portfolio','services','prices','contact','instagram'];
  const DEFAULT_SIZE = 85;
  const ARROW_FILE_REMAP = {
    'arrow-left.svg': 'style-svg-l.svg',
    'arrow-right.svg': 'style-svg-r.svg',
    'left-a.png': 'style-a-l.png',
    'right-a.png': 'style-a-r.png',
    'left-b.png': 'style-b-l.png',
    'right-b.png': 'style-b-r.png',
  };
  const ARROW_STYLES = ['style-svg', 'style-a', 'style-b'];
  const LINKS = [
    { id: 'about',          label: 'About' },
    { id: 'projects',       label: 'Projects' },
    { id: 'shop',           label: 'Shop' },
    { id: 'street',         label: 'Street' },
    { id: 'weddings',       label: 'Weddings' },
    { id: 'portraits',      label: 'Portraits' },
    { id: 'videos',         label: 'Videos' },
    { id: 'graphic-design', label: 'Graphic Design' },
    { id: 'websites',       label: 'Websites' },
    { id: 'instagram',      label: 'Instagram' },
    { id: 'email',          label: 'Email' },
    { id: 'blog',           label: 'Blog' },
  ];

  /* ── Layout defaults + load from localStorage ────────── */
  let layout = {
    shelfBottom:      72,
    iconOffsets:      {},
    iconSizes:        {},
    menuUrls:         {},
    galleryThumbs:    { width: 535, height: 302, gapX: 140, gapY: 76 },
    galleryTitles:    {},
    iconHoverEffect:  true,
    iconDropShadow:   true,
    arrows: {
      left:  { file: 'style-a-l.png',  x: 90, y: 0, w: 52 },
      right: { file: 'style-a-r.png', x: 90, y: 0, w: 52 },
    },
    gallery: { popupX: 0, popupY: 0, popupScale: 1 },
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.shelfBottom != null)     layout.shelfBottom     = saved.shelfBottom;
    if (saved.iconHoverEffect != null) layout.iconHoverEffect = saved.iconHoverEffect;
    if (saved.iconDropShadow  != null) layout.iconDropShadow  = saved.iconDropShadow;
    Object.assign(layout.iconOffsets, saved.iconOffsets || {});
    Object.assign(layout.iconSizes,   saved.iconSizes   || {});
    Object.assign(layout.menuUrls,    saved.menuUrls    || {});
    if (saved.galleryThumbs) Object.assign(layout.galleryThumbs, saved.galleryThumbs);
    if (saved.galleryTitles) Object.assign(layout.galleryTitles, saved.galleryTitles);
    if (saved.arrows) {
      if (saved.arrows.left)  Object.assign(layout.arrows.left,  saved.arrows.left);
      if (saved.arrows.right) Object.assign(layout.arrows.right, saved.arrows.right);
    }
    if (saved.gallery) Object.assign(layout.gallery, saved.gallery);
  } catch (e) {}

  function remapArrowFile(file) {
    return ARROW_FILE_REMAP[file] || file;
  }

  function pairFile(style, side) {
    return `${style}-${side === 'left' ? 'l' : 'r'}${style === 'style-svg' ? '.svg' : '.png'}`;
  }

  function getArrowStyle(file) {
    const clean = remapArrowFile(file || '');
    const match = clean.match(/^(style-[a-z]+)-[lr]\.(png|svg)$/i);
    return match ? match[1] : 'style-a';
  }

  function syncArrowPair() {
    const style = getArrowStyle(layout.arrows.left.file);
    const x = layout.arrows.left.x;
    const y = layout.arrows.left.y;
    const w = layout.arrows.left.w;
    layout.arrows.left = { file: pairFile(style, 'left'), x, y, w };
    layout.arrows.right = { file: pairFile(style, 'right'), x, y, w };
  }

  layout.arrows.left.file = remapArrowFile(layout.arrows.left.file);
  layout.arrows.right.file = remapArrowFile(layout.arrows.right.file);
  syncArrowPair();

  /* ── Selection state ────────────────────────────────── */
  let sel = new Set();
  function iconEl(a)  { return document.querySelector(`.dock-icon[data-action="${a}"]`); }
  function iconImg(a) { const ic = iconEl(a); return ic ? ic.querySelector('img') : null; }
  function clearSel() {
    sel.forEach(a => { const ic = iconEl(a); if (ic) ic.classList.remove('nje-sel'); });
    sel.clear();
  }
  function addSel(a) { sel.add(a); const ic = iconEl(a); if (ic) ic.classList.add('nje-sel'); }
  function toggleSel(a) {
    sel.has(a) ? (sel.delete(a), iconEl(a) && iconEl(a).classList.remove('nje-sel'))
               : addSel(a);
  }

  /* ── Apply arrow to live DOM ─────────────────────────── */
  function applyArrow(side) {
    const el = document.getElementById('arrow-' + side);
    if (!el) return;
    const cfg = layout.arrows[side];
    if (cfg.file) el.src = ARROW_PATH + cfg.file;
    el.style.width     = cfg.w + 'px';
    el.style.marginTop = cfg.y + 'px';
    if (side === 'left')  el.style.left  = '-' + cfg.x + 'px';
    if (side === 'right') el.style.right = '-' + cfg.x + 'px';
  }

  /* ── Apply gallery popup position / scale ────────────── */
  function applyGalleryPopup() {
    const { popupX: x, popupY: y, popupScale: s } = layout.gallery;
    document.querySelectorAll('.popup-overlay .popup-window').forEach(pw => {
      pw.style.transform = `translate(calc(-50% + ${x}px), calc(-60% + ${y}px)) scale(${s})`;
    });
  }

  function applyGalleryThumbLayout() {
    const root = document.documentElement;
    root.style.setProperty('--gallery-thumb-width',  layout.galleryThumbs.width + 'px');
    root.style.setProperty('--gallery-thumb-height', layout.galleryThumbs.height + 'px');
    root.style.setProperty('--gallery-gap-x',        layout.galleryThumbs.gapX + 'px');
    root.style.setProperty('--gallery-gap-y',        layout.galleryThumbs.gapY + 'px');
  }

  function titleEl(key) {
    return document.querySelector(`.gallery-thumb[data-gallery="${key}"] .gallery-thumb-window-title`);
  }

  function ensureTitleLayout(key) {
    if (!layout.galleryTitles[key]) {
      layout.galleryTitles[key] = { x: 0, y: 0, scale: 1 };
    }
    return layout.galleryTitles[key];
  }

  function applyGalleryTitleLayout(key) {
    const title = titleEl(key);
    if (!title) return;
    const cfg = ensureTitleLayout(key);
    title.style.transform = `translate(${cfg.x}px, ${cfg.y}px) scale(${cfg.scale})`;
  }

  function applyAllGalleryTitleLayouts() {
    ['street', 'portrait', 'liminal', 'wedding', 'landscape'].forEach(applyGalleryTitleLayout);
  }

  /* ── Apply full layout to DOM ───────────────────────── */
  function applyLayout() {
    const di = document.querySelector('.dock-icons');
    if (di) di.style.bottom = layout.shelfBottom + 'px';

    // Icon effect classes
    const s = document.getElementById('stage');
    if (s) {
      s.classList.toggle('no-icon-hover',  !layout.iconHoverEffect);
      s.classList.toggle('no-icon-shadow', !layout.iconDropShadow);
    }

    ICON_ACTIONS.forEach(a => {
      const ic  = iconEl(a);
      const img = iconImg(a);
      if (!ic) return;
      ic.style.setProperty('--icon-y', (layout.iconOffsets[a] || 0) + 'px');
      if (img) {
        const sz = layout.iconSizes[a] || DEFAULT_SIZE;
        if (sz !== DEFAULT_SIZE) { img.style.width = sz+'px'; img.style.height = sz+'px'; }
        else { img.style.removeProperty('width'); img.style.removeProperty('height'); }
      }
    });

    document.querySelectorAll('.dropdown-item[data-link-id]').forEach(item => {
      const url = layout.menuUrls[item.dataset.linkId];
      if (url) { item.dataset.href = url; item.classList.remove('inactive'); }
      else      { delete item.dataset.href; if (!item.dataset.action) item.classList.add('inactive'); }
    });

    applyArrow('left');
    applyArrow('right');
    applyGalleryPopup();
    applyGalleryThumbLayout();
    applyAllGalleryTitleLayouts();
  }

  function setIconY(a, y) {
    layout.iconOffsets[a] = y;
    const ic = iconEl(a);
    if (ic) ic.style.setProperty('--icon-y', y + 'px');
  }
  function setIconSize(a, sz) {
    layout.iconSizes[a] = sz;
    const img = iconImg(a); if (!img) return;
    if (sz !== DEFAULT_SIZE) { img.style.width = sz+'px'; img.style.height = sz+'px'; }
    else { img.style.removeProperty('width'); img.style.removeProperty('height'); }
  }

  /* ── Refresh icon panel sliders ─────────────────────── */
  function refreshIconPanel() {
    const count   = sel.size;
    const actions = [...sel];
    if (count === 0) {
      selNameEl.textContent = '← click / drag to select';
      selNameEl.classList.remove('nje-active');
      iconYSl.disabled = iconSzSl.disabled = true;
      iconYSl.value = 0; iconSzSl.value = DEFAULT_SIZE;
      iconYV.textContent = '0px'; iconSzV.textContent = DEFAULT_SIZE+'px';
    } else {
      selNameEl.textContent = count === 1
        ? actions[0].charAt(0).toUpperCase() + actions[0].slice(1)
        : `${count} icons selected`;
      selNameEl.classList.add('nje-active');
      iconYSl.disabled = iconSzSl.disabled = false;
      const avgY  = Math.round(actions.reduce((s,a) => s + (layout.iconOffsets[a]||0),        0) / count);
      const avgSz = Math.round(actions.reduce((s,a) => s + (layout.iconSizes[a]||DEFAULT_SIZE), 0) / count);
      iconYSl.value = avgY;   iconYV.textContent  = avgY  + 'px';
      iconSzSl.value = avgSz; iconSzV.textContent = avgSz + 'px';
    }
  }

  /* ══════════════════════════════════════════════════════
     INJECT EDIT-MODE CSS
  ══════════════════════════════════════════════════════ */
  const editStyle = document.createElement('style');
  editStyle.id = 'nje-edit-css';
  editStyle.textContent = `
    /* ── Dock icons ─────────────────────────────────── */
    #stage.nje-edit .dock-icon          { cursor: crosshair !important; transition: none !important; }
    #stage.nje-edit .dock-icon:hover    { transform: none !important; }
    #stage.nje-edit .dock-icon:hover img { outline: 2px dashed rgba(245,176,188,.55); outline-offset: 4px; }
    #stage.nje-edit .dock-icon.nje-sel img { outline: 2px solid #F5B0BC !important; outline-offset: 4px; }

    /* ── Rubber-band ────────────────────────────────── */
    #nje-rubber { position:fixed; border:1.5px dashed #F5B0BC; background:rgba(245,176,188,.07); pointer-events:none; z-index:99999; }

    /* ── About Me inline editing ────────────────────── */
    #stage.nje-edit .about-content p        { cursor: text; transition: outline .1s; }
    #stage.nje-edit .about-content p:hover  { outline: 1px dashed rgba(245,176,188,.45); outline-offset: 3px; }
    #stage.nje-edit .about-content p[contenteditable="true"] {
      outline: 1.5px solid #F5B0BC !important; outline-offset: 3px;
      background: rgba(245,176,188,.04) !important;
    }
    body.nje-edit-mode .gallery-thumb-window-title {
      pointer-events: auto !important;
      cursor: move;
    }
    body.nje-edit-mode .gallery-thumb-window-title:hover {
      outline: 1px dashed rgba(245,176,188,.5);
      outline-offset: 3px;
    }
    body.nje-edit-mode .gallery-thumb-window-title.nje-title-active {
      outline: 1.5px solid #F5B0BC !important;
      outline-offset: 3px;
      color: #fff2f6;
    }

    /* ══ PANEL ══════════════════════════════════════════ */
    #nje-panel {
      position: fixed; top: 48px; right: 14px; width: 288px;
      background: #0e0610; border: 2px solid #F5B0BC;
      box-shadow: 4px 4px 0 rgba(245,176,188,.2);
      font-family: 'Space Mono', monospace; font-size: 10px; color: #F5B0BC;
      z-index: 20000; max-height: calc(100vh - 62px); overflow-y: auto;
      scrollbar-width: thin; scrollbar-color: #4a2060 #0e0610;
      transform: translateX(0);
      opacity: 1;
      transition: transform .18s ease, opacity .18s ease;
      pointer-events: auto;
    }
    #nje-panel.nje-collapsed {
      transform: translateX(calc(100% + 20px));
      opacity: 0;
      pointer-events: none;
    }
    #nje-panel::-webkit-scrollbar       { width: 4px; }
    #nje-panel::-webkit-scrollbar-track { background: #0e0610; }
    #nje-panel::-webkit-scrollbar-thumb { background: #4a2060; }

    #nje-panel-title {
      background: #F5B0BC; color: #0e0610; margin: 0; padding: 7px 12px;
      font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
      position: sticky; top: 0; z-index: 1;
    }

    /* ── Accordion ───────────────────────────────────── */
    .nje-acc-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 12px; cursor: pointer; user-select: none; -webkit-user-select: none;
      border-bottom: 1px solid #1e0c28; font-size: 8px; letter-spacing: 2.5px;
      text-transform: uppercase; color: #F5B0BC; background: #160820; transition: background .12s;
    }
    .nje-acc-hdr:hover { background: #1e0c28; }
    .nje-acc-chevron   { font-size: 9px; transition: transform .18s; display: inline-block; }
    .nje-acc-hdr.open .nje-acc-chevron { transform: rotate(180deg); }
    .nje-acc-body      { display: none; padding: 10px 12px 12px; border-bottom: 1px solid #1e0c28; }
    .nje-acc-body.open { display: block; }

    /* ── Controls ────────────────────────────────────── */
    .nje-sec           { margin-bottom: 10px; }
    .nje-sec:last-child { margin-bottom: 0; }
    .nje-sec-title     { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #7a5080; margin-bottom: 7px; }
    .nje-row           { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .nje-row-tight     { gap: 6px; }
    .nje-val           { min-width: 38px; text-align: right; color: #fff; font-size: 9px; }
    .nje-num {
      width: 62px; background: #160820; border: 1px solid #2e1040;
      color: #fff; font-family: 'Space Mono', monospace; font-size: 9px;
      padding: 4px 5px; outline: none; text-align: right;
    }
    .nje-num:focus { border-color: #F5B0BC; }
    .nje-sl-label      { font-size: 8px; color: #7a5080; margin-bottom: 3px; letter-spacing: 1px; }
    .nje-note          { font-size: 8px; color: #5a3570; letter-spacing: .5px; line-height: 1.5; margin-bottom: 7px; }
    .nje-divider       { border: none; border-top: 1px solid #1e0c28; margin: 10px 0; }
    .nje-subtle        { color: #7a5080; }

    #nje-panel input[type="range"]          { flex: 1; accent-color: #F5B0BC; cursor: pointer; }
    #nje-panel input[type="range"]:disabled { opacity: .3; cursor: default; }
    #nje-panel input[type="text"] {
      width: 100%; background: #160820; border: 1px solid #2e1040;
      color: #ddd; font-family: 'Space Mono', monospace; font-size: 9px;
      padding: 4px 6px; box-sizing: border-box; outline: none;
    }
    #nje-panel input[type="text"]:focus       { border-color: #F5B0BC; }
    #nje-panel input[type="text"]::placeholder { color: #3a1850; }

    /* ── Icon controls ──────────────────────────────── */
    #nje-sel-name            { font-size: 9px; color: #7a5080; margin-bottom: 7px; min-height: 13px; }
    #nje-sel-name.nje-active { color: #fff; }
    .nje-icon-btns           { display: flex; gap: 6px; margin-bottom: 8px; }
    .nje-icon-btns button {
      flex: 1; background: #1e0c28; color: #F5B0BC; border: 1px solid #3e1850;
      font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 1px;
      text-transform: uppercase; padding: 5px 2px; cursor: pointer;
    }
    .nje-icon-btns button:hover { background: #3e1050; }

    .nje-mini-btns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .nje-mini-btn {
      background: #1e0c28; color: #F5B0BC; border: 1px solid #3e1850;
      font-family: 'Space Mono', monospace; font-size: 7px; letter-spacing: 1px;
      text-transform: uppercase; padding: 6px 4px; cursor: pointer; text-align: center;
    }
    .nje-mini-btn:hover { background: #3e1050; }
    .nje-mini-btn.wide { grid-column: span 3; }

    /* ── Gallery photo slots ──────────────────────────── */
    .nje-gallery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .nje-slot {
      background: #160820; border: 1px solid #2e1040; padding: 5px;
      cursor: pointer; transition: border-color .15s;
    }
    .nje-slot:hover { border-color: #F5B0BC; }
    .nje-slot-thumb {
      width: 100%; aspect-ratio: 3/2; overflow: hidden; background: #0a0415;
      margin-bottom: 4px; position: relative;
    }
    .nje-slot-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .nje-slot-thumb .nje-slot-overlay {
      position: absolute; inset: 0; background: rgba(245,176,188,.12);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .15s; font-size: 16px;
    }
    .nje-slot:hover .nje-slot-overlay { opacity: 1; }
    .nje-slot-num          { font-size: 7px; color: #7a5080; text-align: center; letter-spacing: 1px; margin-top: 3px; }
    .nje-slot-empty        { opacity: .35; cursor: default; }
    .nje-slot-empty:hover  { border-color: #2e1040 !important; }
    .nje-slot-missing {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      font-size: 7px; color: #3a1850; text-align: center; padding: 4px; line-height: 1.3;
    }

    /* ── Arrow picker ─────────────────────────────────── */
    .nje-arrow-side-title { font-size: 8px; color: #7a5080; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
    .nje-arrow-grid       { display: flex; flex-wrap: wrap; gap: 5px; min-height: 38px; margin-bottom: 4px; }
    .nje-arrow-thumb {
      width: 52px; height: 70px; background: #160820; border: 2px solid #2e1040;
      cursor: pointer; display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 4px 2px; overflow: hidden; transition: border-color .12s;
    }
    .nje-arrow-thumb:hover  { border-color: #7a5080; }
    .nje-arrow-thumb.active { border-color: #F5B0BC !important; background: #1e0c28; }
    .nje-arrow-thumb img    { max-width: 28px; max-height: 40px; object-fit: contain; pointer-events: none; }
    .nje-arrow-lbl          { font-size: 7px; color: #7a5080; text-align: center; margin-top: 3px; letter-spacing: .5px; pointer-events: none; }
    .nje-arrow-thumb.active .nje-arrow-lbl { color: #F5B0BC; }

    /* ── Toggle switch ───────────────────────────────── */
    .nje-toggle-row  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 9px; color: #ccc; }
    .nje-toggle      { position: relative; width: 30px; height: 16px; cursor: pointer; flex-shrink: 0; }
    .nje-toggle input { display: none; }
    .nje-toggle-pill {
      position: absolute; inset: 0; background: #2e1040; border-radius: 8px; transition: background .2s;
    }
    .nje-toggle input:checked + .nje-toggle-pill { background: #F5B0BC; }
    .nje-toggle-pill::after {
      content: ''; position: absolute; width: 12px; height: 12px; background: #fff;
      border-radius: 50%; top: 2px; left: 2px; transition: transform .2s;
    }
    .nje-toggle input:checked + .nje-toggle-pill::after { transform: translateX(14px); }

    /* ── Centre / action buttons ──────────────────────── */
    .nje-action-btn {
      width: 100%; background: #1e0c28; color: #F5B0BC; border: 1px solid #3e1850;
      font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 1px;
      text-transform: uppercase; padding: 6px; cursor: pointer; margin-top: 6px;
    }
    .nje-action-btn:hover { background: #3e1050; }

    /* ── Link rows ────────────────────────────────────── */
    .nje-link-row   { margin-bottom: 7px; }
    .nje-link-label { font-size: 8px; color: #7a5080; margin-bottom: 2px; letter-spacing: 1.5px; text-transform: uppercase; }

    /* ── Save / Reset ─────────────────────────────────── */
    .nje-btns { display: flex; gap: 8px; padding: 10px 12px 12px; }
    .nje-btns button {
      flex: 1; background: #F5B0BC; color: #0e0610; border: none;
      font-family: 'Space Mono', monospace; font-size: 8px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 4px; cursor: pointer;
    }
    .nje-btns button:hover            { background: #b83060; color: #fff; }
    .nje-btns button.nje-reset-btn    { background: #1e0c28; color: #F5B0BC; border: 1px solid #3e1850; }
    .nje-btns button.nje-reset-btn:hover { background: #3e1050; }

    #nje-save-msg       { padding: 5px 12px 8px; font-size: 8px; letter-spacing: .5px; line-height: 1.5; display: none; white-space: pre-line; }
    #nje-save-msg.ok    { color: #8BE67A; }
    #nje-save-msg.err   { color: #FF6B5B; }

    /* ── Edit badge ───────────────────────────────────── */
    #nje-badge {
      position: absolute; top: 36px; left: 50%; transform: translateX(-50%);
      background: #b83060; color: #fff; font-family: 'Space Mono', monospace;
      font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      padding: 2px 10px; z-index: 9998; pointer-events: none;
    }

    /* ── Floating controls (pen + save) ──────────────── */
    #nje-controls {
      position: fixed; top: 14px; right: 14px;
      display: flex; gap: 3px; z-index: 20001;
      pointer-events: auto;
    }
    #nje-controls button {
      width: 28px; height: 28px;
      background: #1e0c28; color: #F5B0BC;
      border: 1px solid #3e1850; cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Mono', monospace; transition: background .12s;
    }
    #nje-controls button:hover { background: #3e1050; }
    #nje-ctrl-panel.nje-active { background: #F5B0BC !important; color: #0e0610 !important; }
  `;
  document.head.appendChild(editStyle);

  /* ── Gallery: probe which portfolio-NN.jpg files exist ───── */
  const EDIT_GALLERY_MAX  = 30;
  const EDIT_GALLERY_BASE = 'images/galleries/portfolio/portfolio-';
  const EDIT_GALLERY_EXT  = '.jpg';
  // Will be populated async; used to render the status grid
  let galleryProbeResults = []; // array of { n, exists, src }

  /* ══════════════════════════════════════════════════════
     BUILD PANEL HTML
  ══════════════════════════════════════════════════════ */
  const al = layout.arrows.left;
  const arrowStyle = getArrowStyle(layout.arrows.left.file);
  const gp = layout.gallery;
  const gt = layout.galleryThumbs;

  const panel = document.createElement('div');
  panel.id = 'nje-panel';
  panel.innerHTML = `
    <div id="nje-panel-title">✎ Edit Mode</div>

    <!-- ══ GALLERY ══ -->
    <div class="nje-acc-hdr open" data-acc="gallery">
      <span>🖼 Windows &amp; Galleries</span><span class="nje-acc-chevron">▼</span>
    </div>
    <div class="nje-acc-body open" id="nje-acc-gallery">

      <div class="nje-sec">
        <div class="nje-sec-title">Arrows</div>
        <div class="nje-note">Files in: <strong style="color:#F5B0BC">images/arrows/</strong><br>
          Replace a matching left/right pair with the same style name to update its design.</div>

        <div class="nje-arrow-side-title">Arrow Style</div>
        <div class="nje-arrow-grid" id="nje-arrow-styles"></div>
        <div class="nje-sl-label" style="margin-top:8px">X — distance from popup edge</div>
        <div class="nje-row">
          <input type="range" id="nje-al-x" min="20" max="200" step="1" value="${al.x}">
          <span class="nje-val" id="nje-al-xv">${al.x}px</span>
        </div>
        <div class="nje-sl-label">Y — offset from centre</div>
        <div class="nje-row">
          <input type="range" id="nje-al-y" min="-150" max="150" step="1" value="${al.y}">
          <span class="nje-val" id="nje-al-yv">${al.y}px</span>
        </div>
        <div class="nje-sl-label">Size</div>
        <div class="nje-row">
          <input type="range" id="nje-al-w" min="16" max="120" step="1" value="${al.w}">
          <span class="nje-val" id="nje-al-wv">${al.w}px</span>
        </div>
      </div>

      <hr class="nje-divider">

      <div class="nje-sec">
        <div class="nje-sec-title">Popup Windows</div>
        <div class="nje-sl-label">Preview Window</div>
        <div class="nje-mini-btns" style="margin-bottom:8px;">
          <button class="nje-mini-btn wide" id="nje-open-preview">Open Portfolio Preview</button>
          <button class="nje-mini-btn wide" id="nje-close-gallery">Close Gallery</button>
        </div>
        <div class="nje-note">These controls apply to all popup windows. Arrow settings matter for galleries. Popup size applies across galleries and text windows like About Me.</div>
        <div class="nje-sl-label">Popup Size</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-gp-s" min="60" max="140" step="1" value="${Math.round(gp.popupScale * 100)}">
          <input class="nje-num" type="number" id="nje-gp-sn" min="60" max="140" step="1" value="${Math.round(gp.popupScale * 100)}">
          <span class="nje-val" id="nje-gp-sv">${Math.round(gp.popupScale * 100)}%</span>
        </div>
        <button class="nje-action-btn" id="nje-gp-center">⊕ Reset Popup</button>
      </div>

      <hr class="nje-divider">

      <div class="nje-sec">
        <div class="nje-sec-title">Gallery Section Windows</div>
        <div class="nje-note">Use the number boxes when you want matching values across all four gallery windows.</div>
        <div class="nje-sl-label">Window Width</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-gt-w" min="320" max="760" step="1" value="${gt.width}">
          <input class="nje-num" type="number" id="nje-gt-wn" min="320" max="760" step="1" value="${gt.width}">
          <span class="nje-val" id="nje-gt-wv">${gt.width}px</span>
        </div>
        <div class="nje-sl-label">Window Height</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-gt-h" min="180" max="460" step="1" value="${gt.height}">
          <input class="nje-num" type="number" id="nje-gt-hn" min="180" max="460" step="1" value="${gt.height}">
          <span class="nje-val" id="nje-gt-hv">${gt.height}px</span>
        </div>
        <div class="nje-sl-label">Horizontal Gap</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-gt-gx" min="30" max="220" step="1" value="${gt.gapX}">
          <input class="nje-num" type="number" id="nje-gt-gxn" min="30" max="220" step="1" value="${gt.gapX}">
          <span class="nje-val" id="nje-gt-gxv">${gt.gapX}px</span>
        </div>
        <div class="nje-sl-label">Vertical Gap</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-gt-gy" min="20" max="180" step="1" value="${gt.gapY}">
          <input class="nje-num" type="number" id="nje-gt-gyn" min="20" max="180" step="1" value="${gt.gapY}">
          <span class="nje-val" id="nje-gt-gyv">${gt.gapY}px</span>
        </div>
      </div>

      <hr class="nje-divider">

      <div class="nje-sec">
        <div class="nje-sec-title">Thumbnail Titles</div>
        <div class="nje-note">Click a thumbnail title on the page. These controls will then move and scale only that selected title.</div>
        <div id="nje-title-selected" class="nje-subtle" style="font-size:9px; margin-bottom:8px;">No title selected</div>
        <div class="nje-sl-label">Title X</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-tt-x" min="-120" max="120" step="1" value="0" disabled>
          <input class="nje-num" type="number" id="nje-tt-xn" min="-120" max="120" step="1" value="0" disabled>
          <span class="nje-val" id="nje-tt-xv">0px</span>
        </div>
        <div class="nje-sl-label">Title Y</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-tt-y" min="-40" max="40" step="1" value="0" disabled>
          <input class="nje-num" type="number" id="nje-tt-yn" min="-40" max="40" step="1" value="0" disabled>
          <span class="nje-val" id="nje-tt-yv">0px</span>
        </div>
        <div class="nje-sl-label">Title Scale</div>
        <div class="nje-row nje-row-tight">
          <input type="range" id="nje-tt-s" min="50" max="160" step="1" value="100" disabled>
          <input class="nje-num" type="number" id="nje-tt-sn" min="50" max="160" step="1" value="100" disabled>
          <span class="nje-val" id="nje-tt-sv">100%</span>
        </div>
      </div>

    </div>

    <!-- ══ DOCK ══ -->
    <div class="nje-acc-hdr" data-acc="dock">
      <span>⚓ Dock</span><span class="nje-acc-chevron">▼</span>
    </div>
    <div class="nje-acc-body" id="nje-acc-dock">

      <div class="nje-sec">
        <div class="nje-sec-title">Icon Effects</div>
        <div class="nje-toggle-row">
          <span>Hover Enlarge</span>
          <label class="nje-toggle">
            <input type="checkbox" id="nje-tog-hover" ${layout.iconHoverEffect ? 'checked' : ''}>
            <span class="nje-toggle-pill"></span>
          </label>
        </div>
        <div class="nje-toggle-row">
          <span>Drop Shadow</span>
          <label class="nje-toggle">
            <input type="checkbox" id="nje-tog-shadow" ${layout.iconDropShadow ? 'checked' : ''}>
            <span class="nje-toggle-pill"></span>
          </label>
        </div>
      </div>

      <div class="nje-sec">
        <div class="nje-sec-title">Shelf Height</div>
        <div class="nje-row">
          <input type="range" id="nje-shelf" min="20" max="220" step="1" value="${layout.shelfBottom}">
          <span class="nje-val" id="nje-shelf-v">${layout.shelfBottom}px</span>
        </div>
      </div>

      <div class="nje-sec">
        <div class="nje-sec-title">Icons</div>
        <div class="nje-icon-btns">
          <button id="nje-sel-all">Select All</button>
          <button id="nje-level">Level All</button>
        </div>
        <div id="nje-sel-name">← click / drag to select</div>
        <div class="nje-sl-label">Y Position</div>
        <div class="nje-row">
          <input type="range" id="nje-icon-y" min="-120" max="120" step="1" value="0" disabled>
          <span class="nje-val" id="nje-icon-y-v">0px</span>
        </div>
        <div class="nje-sl-label" style="margin-top:6px">Size</div>
        <div class="nje-row">
          <input type="range" id="nje-icon-size" min="30" max="160" step="1" value="${DEFAULT_SIZE}" disabled>
          <span class="nje-val" id="nje-icon-size-v">${DEFAULT_SIZE}px</span>
        </div>
      </div>

    </div>

    <!-- ══ ABOUT ME ══ -->
    <div class="nje-acc-hdr" data-acc="about">
      <span>👤 About Me</span><span class="nje-acc-chevron">▼</span>
    </div>
    <div class="nje-acc-body" id="nje-acc-about">
      <div class="nje-note">Open the About Me popup, then click any paragraph to edit it directly on screen. Click away or press Esc when done.</div>
    </div>

    <!-- ══ PAGE LINKS ══ -->
    <div class="nje-acc-hdr" data-acc="links">
      <span>🔗 Page Links</span><span class="nje-acc-chevron">▼</span>
    </div>
    <div class="nje-acc-body" id="nje-acc-links">
      ${LINKS.map(l => `
        <div class="nje-link-row">
          <div class="nje-link-label">${l.label}</div>
          <input type="text" id="nje-url-${l.id}"
            placeholder="https:// or mailto:..."
            value="${(layout.menuUrls[l.id]||'').replace(/"/g,'&quot;')}">
        </div>`).join('')}
    </div>

    <!-- ══ SAVE / RESET ══ -->
    <div class="nje-btns">
      <button id="nje-save">💾 Save &amp; Download</button>
      <button class="nje-reset-btn" id="nje-reset">↺ Reset</button>
    </div>
    <div id="nje-save-msg"></div>
  `;

  const stage = document.getElementById('stage');
  stage.classList.add('nje-edit');
  document.body.classList.add('nje-edit-mode');
  document.body.appendChild(panel);

  applyLayout();

  /* ── Floating controls (pen toggle + save) ──────────── */
  const controls = document.createElement('div');
  controls.id = 'nje-controls';
  controls.innerHTML = `
    <button id="nje-ctrl-panel" class="nje-active" title="Toggle edit panel">✎</button>
    <button id="nje-ctrl-save" title="Save &amp; Download">💾</button>
  `;
  document.body.appendChild(controls);

  // Panel toggle
  let panelVisible = true;
  function setPanelVisible(v) {
    panelVisible = v;
    panel.classList.toggle('nje-collapsed', !v);
    stage.classList.toggle('nje-edit', v);
    document.body.classList.toggle('nje-edit-mode', v);
    const btn = document.getElementById('nje-ctrl-panel');
    if (btn) btn.classList.toggle('nje-active', v);
  }
  document.getElementById('nje-ctrl-panel').addEventListener('click', () => setPanelVisible(!panelVisible));
  document.getElementById('nje-ctrl-save').addEventListener('click', () => triggerSave());

  function setAccordion(name, open) {
    const hdr = document.querySelector(`.nje-acc-hdr[data-acc="${name}"]`);
    const body = document.getElementById('nje-acc-' + name);
    if (!hdr || !body) return;
    hdr.classList.toggle('open', open);
    body.classList.toggle('open', open);
  }

  function focusGalleryControls() {
    setAccordion('gallery', true);
    if (panelVisible) panel.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* NOTE: refreshTitleControls() must NOT be called here — the panel refs
     below are consts and calling it before they exist throws a ReferenceError
     that kills the whole edit script. It is called after the refs instead. */

  /* ── Panel refs ─────────────────────────────────────── */
  const shelfSl  = document.getElementById('nje-shelf');
  const shelfV   = document.getElementById('nje-shelf-v');
  const selNameEl= document.getElementById('nje-sel-name');
  const iconYSl  = document.getElementById('nje-icon-y');
  const iconYV   = document.getElementById('nje-icon-y-v');
  const iconSzSl = document.getElementById('nje-icon-size');
  const iconSzV  = document.getElementById('nje-icon-size-v');
  const titleSelEl = document.getElementById('nje-title-selected');
  const titleXSl = document.getElementById('nje-tt-x');
  const titleXN = document.getElementById('nje-tt-xn');
  const titleXV = document.getElementById('nje-tt-xv');
  const titleYSl = document.getElementById('nje-tt-y');
  const titleYN = document.getElementById('nje-tt-yn');
  const titleYV = document.getElementById('nje-tt-yv');
  const titleSSl = document.getElementById('nje-tt-s');
  const titleSN = document.getElementById('nje-tt-sn');
  const titleSV = document.getElementById('nje-tt-sv');
  let activeGalleryTitle = null;

  function refreshTitleControls() {
    const disabled = !activeGalleryTitle;
    [titleXSl, titleXN, titleYSl, titleYN, titleSSl, titleSN].forEach(el => { if (el) el.disabled = disabled; });
    document.querySelectorAll('.gallery-thumb-window-title').forEach(el => el.classList.remove('nje-title-active'));
    if (!activeGalleryTitle) {
      titleSelEl.textContent = 'No title selected';
      titleXV.textContent = '0px';
      titleYV.textContent = '0px';
      titleSV.textContent = '100%';
      titleXSl.value = titleXN.value = 0;
      titleYSl.value = titleYN.value = 0;
      titleSSl.value = titleSN.value = 100;
      return;
    }
    const cfg = ensureTitleLayout(activeGalleryTitle);
    const title = titleEl(activeGalleryTitle);
    if (title) title.classList.add('nje-title-active');
    titleSelEl.textContent = `${activeGalleryTitle.charAt(0).toUpperCase() + activeGalleryTitle.slice(1)} title selected`;
    titleXSl.value = titleXN.value = cfg.x;
    titleYSl.value = titleYN.value = cfg.y;
    titleSSl.value = titleSN.value = Math.round(cfg.scale * 100);
    titleXV.textContent = `${cfg.x}px`;
    titleYV.textContent = `${cfg.y}px`;
    titleSV.textContent = `${Math.round(cfg.scale * 100)}%`;
  }

  refreshTitleControls();

  /* ══════════════════════════════════════════════════════
     ACCORDION
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.nje-acc-hdr').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const body = document.getElementById('nje-acc-' + hdr.dataset.acc);
      const open = hdr.classList.contains('open');
      hdr.classList.toggle('open', !open);
      if (body) body.classList.toggle('open', !open);
    });
  });

  /* ══════════════════════════════════════════════════════
     ARROW PICKER
     Load from data/arrows.json — separate lists per side.
     Falls back to defaults if fetch fails (e.g. file://).
  ══════════════════════════════════════════════════════ */
  let arrowStyles = [...ARROW_STYLES];

  function arrowLabel(style) {
    if (style === 'style-svg') return 'SVG';
    const m = style.match(/style-([a-z]+)/i);
    return m ? 'Style ' + m[1].toUpperCase() : style;
  }

  function renderArrowPicker() {
    const grid = document.getElementById('nje-arrow-styles');
    if (!grid) return;
    const current = getArrowStyle(layout.arrows.left.file);
    const nc = Date.now();
    grid.innerHTML = arrowStyles.map(style => `
      <div class="nje-arrow-thumb ${style === current ? 'active' : ''}"
           data-style="${style}" title="${style}">
        <img src="${ARROW_PATH}${pairFile(style, 'left')}?nc=${nc}" alt="${style}">
        <span class="nje-arrow-lbl">${arrowLabel(style)}</span>
      </div>
    `).join('');
    grid.querySelectorAll('.nje-arrow-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        layout.arrows.left.file = pairFile(thumb.dataset.style, 'left');
        layout.arrows.right.file = pairFile(thumb.dataset.style, 'right');
        applyArrow('left');
        applyArrow('right');
        grid.querySelectorAll('.nje-arrow-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  fetch('data/arrows.json?t=' + Date.now())
    .then(r => r.json())
    .then(data => {
      if (data.styles && Array.isArray(data.styles) && data.styles.length) {
        arrowStyles = data.styles;
      }
      renderArrowPicker();
    })
    .catch(() => {
      renderArrowPicker();
    });

  /* ══════════════════════════════════════════════════════
     ARROW SLIDERS
  ══════════════════════════════════════════════════════ */
  ['x','y','w'].forEach(axis => {
    const sl = document.getElementById(`nje-al-${axis}`);
    const vl = document.getElementById(`nje-al-${axis}v`);
    if (!sl) return;
    sl.addEventListener('input', function () {
      const v = parseInt(this.value);
      vl.textContent = v + 'px';
      layout.arrows.left[axis] = v;
      layout.arrows.right[axis] = v;
      applyArrow('left');
      applyArrow('right');
    });
  });

  /* ══════════════════════════════════════════════════════
     GALLERY POPUP CONTROLS
  ══════════════════════════════════════════════════════ */
  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function syncPopupScale(value) {
    const v = clamp(parseInt(value) || 100, 60, 140);
    layout.gallery.popupScale = v / 100;
    document.getElementById('nje-gp-s').value = v;
    document.getElementById('nje-gp-sn').value = v;
    document.getElementById('nje-gp-sv').textContent = v + '%';
    applyGalleryPopup();
  }

  document.getElementById('nje-gp-s').addEventListener('input', function () {
    syncPopupScale(this.value);
  });
  document.getElementById('nje-gp-sn').addEventListener('input', function () {
    syncPopupScale(this.value);
  });
  document.getElementById('nje-gp-center').addEventListener('click', () => {
    layout.gallery.popupX = 0; layout.gallery.popupY = 0; layout.gallery.popupScale = 1;
    document.getElementById('nje-gp-s').value = 100;
    document.getElementById('nje-gp-sn').value = 100;
    document.getElementById('nje-gp-sv').textContent = '100%';
    applyGalleryPopup();
  });

  [['w','width'], ['h','height'], ['gx','gapX'], ['gy','gapY']].forEach(([id, key]) => {
    const sl = document.getElementById(`nje-gt-${id}`);
    const num = document.getElementById(`nje-gt-${id}n`);
    const vl = document.getElementById(`nje-gt-${id}v`);
    if (!sl) return;
    const min = parseInt(sl.min);
    const max = parseInt(sl.max);
    const sync = value => {
      const v = clamp(parseInt(value) || min, min, max);
      layout.galleryThumbs[key] = v;
      sl.value = v;
      if (num) num.value = v;
      vl.textContent = v + 'px';
      applyGalleryThumbLayout();
    };
    sl.addEventListener('input', function () { sync(this.value); });
    if (num) num.addEventListener('input', function () { sync(this.value); });
  });

  function syncTitleControl(axis, value) {
    if (!activeGalleryTitle) return;
    const cfg = ensureTitleLayout(activeGalleryTitle);
    if (axis === 'scale') {
      const v = clamp(parseInt(value) || 100, 50, 160);
      cfg.scale = v / 100;
      titleSSl.value = titleSN.value = v;
      titleSV.textContent = `${v}%`;
    } else if (axis === 'x') {
      const v = clamp(parseInt(value) || 0, -120, 120);
      cfg.x = v;
      titleXSl.value = titleXN.value = v;
      titleXV.textContent = `${v}px`;
    } else if (axis === 'y') {
      const v = clamp(parseInt(value) || 0, -40, 40);
      cfg.y = v;
      titleYSl.value = titleYN.value = v;
      titleYV.textContent = `${v}px`;
    }
    applyGalleryTitleLayout(activeGalleryTitle);
  }

  titleXSl.addEventListener('input', function () { syncTitleControl('x', this.value); });
  titleXN.addEventListener('input', function () { syncTitleControl('x', this.value); });
  titleYSl.addEventListener('input', function () { syncTitleControl('y', this.value); });
  titleYN.addEventListener('input', function () { syncTitleControl('y', this.value); });
  titleSSl.addEventListener('input', function () { syncTitleControl('scale', this.value); });
  titleSN.addEventListener('input', function () { syncTitleControl('scale', this.value); });

  document.querySelectorAll('.gallery-thumb, .dock-icon[data-action="portfolio"], .dropdown-item[data-action="open-gallery"]').forEach(el => {
    el.addEventListener('click', () => window.setTimeout(focusGalleryControls, 80));
  });

  document.querySelectorAll('.gallery-thumb-window-title').forEach(title => {
    title.addEventListener('click', e => {
      if (!panelVisible) return;
      e.preventDefault();
      e.stopPropagation();
      const thumb = title.closest('.gallery-thumb');
      if (!thumb) return;
      activeGalleryTitle = thumb.dataset.gallery || null;
      refreshTitleControls();
      focusGalleryControls();
    });
  });

  document.getElementById('nje-open-preview').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.openGallery === 'function') {
      window.openGallery('portfolio');
    }
    focusGalleryControls();
  });
  document.getElementById('nje-close-gallery').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.closeGallery === 'function') {
      window.closeGallery();
    }
    focusGalleryControls();
  });

  /* ══════════════════════════════════════════════════════
     ICON EFFECT TOGGLES
  ══════════════════════════════════════════════════════ */
  document.getElementById('nje-tog-hover').addEventListener('change', function () {
    layout.iconHoverEffect = this.checked;
    document.getElementById('stage').classList.toggle('no-icon-hover', !this.checked);
  });
  document.getElementById('nje-tog-shadow').addEventListener('change', function () {
    layout.iconDropShadow = this.checked;
    document.getElementById('stage').classList.toggle('no-icon-shadow', !this.checked);
  });

  /* ══════════════════════════════════════════════════════
     DOCK CONTROLS
  ══════════════════════════════════════════════════════ */
  shelfSl.addEventListener('input', function () {
    layout.shelfBottom = parseInt(this.value);
    shelfV.textContent = layout.shelfBottom + 'px';
    const di = document.querySelector('.dock-icons');
    if (di) di.style.bottom = layout.shelfBottom + 'px';
  });

  ICON_ACTIONS.forEach(a => {
    const ic = iconEl(a); if (!ic) return;
    ic.addEventListener('click', e => {
      if (!panelVisible) return;
      e.stopPropagation();
      e.shiftKey ? toggleSel(a) : (clearSel(), addSel(a));
      refreshIconPanel();
    });
  });

  stage.addEventListener('click', e => {
    if (!panelVisible) return;
    if (!e.target.closest('.dock-icon') && !e.target.closest('#nje-panel')) {
      clearSel(); refreshIconPanel();
    }
  });

  document.getElementById('nje-sel-all').addEventListener('click', () => { clearSel(); ICON_ACTIONS.forEach(addSel); refreshIconPanel(); });
  document.getElementById('nje-level').addEventListener('click',   () => { sel.forEach(a => setIconY(a, 0)); refreshIconPanel(); });

  iconYSl.addEventListener('input', function () {
    const y = parseInt(this.value);
    iconYV.textContent = y + 'px';
    sel.forEach(a => setIconY(a, y));
  });
  iconSzSl.addEventListener('input', function () {
    const sz = parseInt(this.value);
    iconSzV.textContent = sz + 'px';
    sel.forEach(a => setIconSize(a, sz));
  });

  /* ══════════════════════════════════════════════════════
     RUBBER-BAND DRAG SELECT
  ══════════════════════════════════════════════════════ */
  let rbActive = false, rbOrigin = null, rbDiv = null;

  stage.addEventListener('mousedown', e => {
    if (!panelVisible) return;
    if (e.target.closest('.dock-icon') || e.target.closest('#nje-panel') || e.target.closest('.menubar')) return;
    if (!e.target.closest('.dock-wrapper')) return;
    rbActive = true;
    rbOrigin = { x: e.clientX, y: e.clientY };
    if (!e.shiftKey) clearSel();
    rbDiv = document.createElement('div');
    rbDiv.id = 'nje-rubber';
    Object.assign(rbDiv.style, { left: rbOrigin.x+'px', top: rbOrigin.y+'px', width:'0', height:'0' });
    document.body.appendChild(rbDiv);
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!rbActive || !rbDiv) return;
    const x0 = Math.min(e.clientX, rbOrigin.x), y0 = Math.min(e.clientY, rbOrigin.y);
    const x1 = Math.max(e.clientX, rbOrigin.x), y1 = Math.max(e.clientY, rbOrigin.y);
    Object.assign(rbDiv.style, { left:x0+'px', top:y0+'px', width:(x1-x0)+'px', height:(y1-y0)+'px' });
  });

  document.addEventListener('mouseup', () => {
    if (!rbActive) return;
    rbActive = false;
    if (rbDiv) {
      const rb = rbDiv.getBoundingClientRect();
      if (rb.width > 4 || rb.height > 4) {
        ICON_ACTIONS.forEach(a => {
          const ic = iconEl(a); if (!ic) return;
          const r = ic.getBoundingClientRect();
          if (!(r.right < rb.left || r.left > rb.right || r.bottom < rb.top || r.top > rb.bottom)) addSel(a);
        });
        refreshIconPanel();
      }
      rbDiv.remove(); rbDiv = null;
    }
    rbOrigin = null;
  });

  /* ══════════════════════════════════════════════════════
     ABOUT ME INLINE EDITING
  ══════════════════════════════════════════════════════ */
  const aboutContent = document.querySelector('.about-content');
  if (aboutContent) {
    aboutContent.querySelectorAll('p').forEach(p => {
      p.addEventListener('click', e => {
        if (!panelVisible) return;
        e.stopPropagation();
        if (p.contentEditable === 'true') return;
        aboutContent.querySelectorAll('[contenteditable="true"]').forEach(el => el.blur());
        p.contentEditable = 'true';
        p.focus();
        try {
          const range = document.createRange();
          range.selectNodeContents(p);
          const s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(range);
        } catch (err) {}
      });
      p.addEventListener('blur',    () => { p.contentEditable = 'false'; });
      p.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); p.blur(); } });
    });
  }

  /* ══════════════════════════════════════════════════════
     PORTFOLIO — probe images 1–30, render status grid
  ══════════════════════════════════════════════════════ */
  function renderGalleryGrid(results) {
    const grid   = document.getElementById('nje-gallery-grid');
    const status = document.getElementById('nje-gallery-status');
    if (!grid) return;

    const found = results.filter(r => r.exists);
    if (status) {
      status.textContent = found.length
        ? `${found.length} image${found.length > 1 ? 's' : ''} detected  ·  ${EDIT_GALLERY_MAX - found.length} slots free`
        : 'No images found — add portfolio-01.jpg to get started';
    }

    grid.innerHTML = results.map(r => `
      <div class="nje-slot ${r.exists ? '' : 'nje-slot-empty'}" title="portfolio-${String(r.n).padStart(2, '0')}.jpg">
        <div class="nje-slot-thumb">
          ${r.exists
            ? `<img src="${r.src}?nc=${Date.now()}" alt="">`
            : `<div class="nje-slot-missing">portfolio-${String(r.n).padStart(2, '0')}.jpg</div>`}
        </div>
        <div class="nje-slot-num">${r.n}</div>
      </div>`).join('');
  }

  // Probe all 30 slots
  (function probeEditGallery() {
    const probes = Array.from({ length: EDIT_GALLERY_MAX }, (_, i) => {
      const n   = i + 1;
      const src = EDIT_GALLERY_BASE + String(n).padStart(2, '0') + EDIT_GALLERY_EXT;
      return new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve({ n, exists: true,  src });
        img.onerror = () => resolve({ n, exists: false, src });
        img.src = src;
      });
    });
    Promise.all(probes).then(results => {
      galleryProbeResults = results;
      // Only show slots up to last found + a few empty ones beyond
      const lastFound = results.reduce((max, r) => r.exists ? r.n : max, 0);
      const showUpTo  = Math.min(lastFound + 3, EDIT_GALLERY_MAX);
      renderGalleryGrid(results.slice(0, showUpTo));
    });
  })();

  /* ══════════════════════════════════════════════════════
     SAVE — shared function, called from panel or menu bar
  ══════════════════════════════════════════════════════ */
  function triggerSave() {
    LINKS.forEach(l => {
      const inp = document.getElementById(`nje-url-${l.id}`);
      if (inp) layout.menuUrls[l.id] = inp.value.trim();
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    applyLayout();

    // Remove all edit-mode DOM + close any open popups before capture
    editStyle.remove();
    panel.remove();
    controls.remove();
    stage.classList.remove('nje-edit');
    document.body.classList.remove('nje-edit-mode');
    document.querySelectorAll('.nje-sel').forEach(ic => ic.classList.remove('nje-sel'));
    document.querySelectorAll('[contenteditable="true"]').forEach(el => { el.contentEditable = 'false'; });
    document.querySelectorAll('.popup-overlay').forEach(p => p.classList.remove('open'));

    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Restore everything
    document.head.appendChild(editStyle);
    stage.classList.add('nje-edit');
    document.body.classList.add('nje-edit-mode');
    document.body.appendChild(panel);
    document.body.appendChild(controls);
    setPanelVisible(panelVisible);

    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'index.html';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMsg('✓ index.html downloaded\nReplace your file to apply changes.', 'ok');
    } catch (err) {
      showMsg('⚠ Download failed: ' + err.message, 'err');
    }
  }

  document.getElementById('nje-save').addEventListener('click', triggerSave);

  /* ── Reset (panel button) ────────────────────────────── */
  document.getElementById('nje-reset').addEventListener('click', () => {
    if (!confirm('Reset all saved layout changes?')) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });

  /* ── showMsg ─────────────────────────────────────────── */
  function showMsg(text, type) {
    const msg = document.getElementById('nje-save-msg');
    msg.textContent   = text;
    msg.className     = type;
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 6000);
  }

})();
