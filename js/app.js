/* ═══════════════════════════════════════════════
   The Adventures of Nicky J — App Logic
   ═══════════════════════════════════════════════ */

const STAGE_W = 1600;
const STAGE_H = 1000;
const GALLERY_MAX = 30;
const DEFAULT_GALLERY_LAYOUT = { width: 535, height: 302, gapX: 140, gapY: 76 };
const stage = document.getElementById('stage');
const stageShell = document.querySelector('.stage-shell');
const gallerySection = document.getElementById('galleries');
const galleryGrid = document.getElementById('gallery-grid');
const popupOverlay = document.getElementById('popup-portfolio');
const popupWindow = popupOverlay.querySelector('.popup-window');
const popupTitle = document.getElementById('gallery-popup-title');
const popupContent = document.getElementById('gallery-popup-content');
const galleryCounter = document.getElementById('gallery-counter');
let popupBaseTransform = '';
const ARROW_FILE_REMAP = {
  'arrow-left.svg': 'style-svg-l.svg',
  'arrow-right.svg': 'style-svg-r.svg',
  'left-a.png': 'style-a-l.png',
  'right-a.png': 'style-a-r.png',
  'left-b.png': 'style-b-l.png',
  'right-b.png': 'style-b-r.png',
};

const galleryConfig = {
  portfolio: {
    title: 'Portfolio',
    base: 'images/galleries/portfolio/portfolio-',
    ext: '.jpg',
    max: 30,
    thumbSelector: null,
  },
  street: {
    title: 'Street',
    base: 'images/galleries/street/street-',
    ext: '.jpg',
    max: 30,
    thumbSelector: '.gallery-thumb[data-gallery="street"]',
    frame: 'images/ui/desktop/street-popup-window.png',
  },
  portrait: {
    title: 'Portrait',
    base: 'images/galleries/portrait/portrait-',
    ext: '.jpg',
    max: 30,
    thumbSelector: '.gallery-thumb[data-gallery="portrait"]',
    frame: 'images/ui/desktop/portrait-popup-window.png',
  },
  liminal: {
    title: 'Liminal Spaces',
    base: 'images/galleries/liminal/liminal-',
    ext: '.jpg',
    max: 30,
    thumbSelector: null, /* not on the landing grid — opened via Content menu */
    frame: 'images/ui/desktop/liminal-popup-window.png',
  },
  wedding: {
    title: 'Wedding',
    base: 'images/galleries/wedding/wedding-',
    ext: '.jpg',
    max: 30,
    thumbSelector: '.gallery-thumb[data-gallery="wedding"]',
    frame: 'images/ui/desktop/wedding-popup-window.png',
  },
  landscape: {
    title: 'Landscape',
    base: 'images/galleries/landscape/landscape-',
    ext: '.jpg',
    max: 30,
    thumbSelector: '.gallery-thumb[data-gallery="landscape"]',
    frame: 'images/ui/desktop/landscape-popup-window.png',
  },
};

/* Per-gallery popup window frames have the gallery title BAKED INTO the art
   (the CSS title never aligned well). When a config has a `frame`, use it and
   hide the CSS title; otherwise fall back to the generic frame + CSS title. */
const DEFAULT_POPUP_FRAME = 'images/ui/desktop/popup-window.png';
function applyPopupFrame(config) {
  const frameEl = popupWindow.querySelector('.popup-frame-img');
  if (!frameEl) return;
  frameEl.src = config.frame || DEFAULT_POPUP_FRAME;
  popupTitle.style.display = config.frame ? 'none' : '';
}

const galleryState = {
  currentKey: null,
  currentSlide: 0,
  slides: [],
  sourceThumb: null,
  closing: false,
  cache: {},
};

function remapArrowFile(file) {
  return ARROW_FILE_REMAP[file] || file;
}

// ── VIEWPORT SCALING ─────────────────────────────
function scaleStage() {
  if (!stage || !stageShell) return;
  const vw = stageShell.clientWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / STAGE_W, vh / STAGE_H, 1);
  const scaledW = STAGE_W * scale;
  const scaledH = STAGE_H * scale;

  stage.style.transform = `scale(${scale})`;
  stage.style.transformOrigin = '0 0';
  stage.style.left = `${(vw - scaledW) / 2}px`;
  stage.style.top = `0px`;
  stageShell.style.height = `${scaledH}px`;
  document.documentElement.style.setProperty('--stage-scaled-width', `${scaledW}px`);
  document.documentElement.style.setProperty('--stage-scaled-height', `${scaledH}px`);
}

scaleStage();
window.addEventListener('resize', scaleStage);


// ── CLOCK ────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m;
}

updateClock();
setInterval(updateClock, 15000);


// ── APPLY SAVED LAYOUT ───────────────────────────
(function applySavedLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem('njay_layout') || '{}');
    if (saved.shelfBottom != null) {
      const di = document.querySelector('.dock-icons');
      if (di) di.style.bottom = saved.shelfBottom + 'px';
    }
    if (stage) {
      if (saved.iconHoverEffect === false) stage.classList.add('no-icon-hover');
      if (saved.iconDropShadow === false) stage.classList.add('no-icon-shadow');
    }
    if (saved.iconOffsets) {
      Object.entries(saved.iconOffsets).forEach(([action, y]) => {
        if (y == null) return;
        const icon = document.querySelector(`.dock-icon[data-action="${action}"]`);
        if (icon) icon.style.setProperty('--icon-y', y + 'px');
      });
    }
    if (saved.iconSizes) {
      Object.entries(saved.iconSizes).forEach(([action, size]) => {
        if (!size || size === 85) return;
        const icon = document.querySelector(`.dock-icon[data-action="${action}"]`);
        const img = icon && icon.querySelector('img');
        if (img) {
          img.style.width = size + 'px';
          img.style.height = size + 'px';
        }
      });
    }
    if (saved.menuUrls) {
      document.querySelectorAll('.dropdown-item[data-link-id]').forEach(item => {
        const url = saved.menuUrls[item.dataset.linkId];
        if (url) {
          item.dataset.href = url;
          item.classList.remove('inactive');
        }
      });
    }
    if (saved.arrows) {
      ['left', 'right'].forEach(side => {
        const cfg = saved.arrows[side];
        if (!cfg) return;
        const el = document.getElementById('arrow-' + side);
        if (!el) return;
        if (cfg.file) el.src = 'images/arrows/' + remapArrowFile(cfg.file);
        el.style.width = (cfg.w != null ? cfg.w : 52) + 'px';
        el.style.marginTop = (cfg.y != null ? cfg.y : 0) + 'px';
        const x = cfg.x != null ? cfg.x : 90;
        if (side === 'left') el.style.left = '-' + x + 'px';
        if (side === 'right') el.style.right = '-' + x + 'px';
      });
    }
    if (saved.gallery) {
      const x = saved.gallery.popupX || 0;
      const y = saved.gallery.popupY || 0;
      const s = saved.gallery.popupScale || 1;
      if (x !== 0 || y !== 0 || s !== 1) {
        document.querySelectorAll('.popup-overlay .popup-window').forEach(pw => {
          pw.style.transform = `translate(calc(-50% + ${x}px), calc(-60% + ${y}px)) scale(${s})`;
        });
      }
    }
    applySavedGalleryLayout(saved.galleryThumbs || {});
    applySavedTitleLayout(saved.galleryTitles || {});
  } catch (e) {}
})();

popupBaseTransform = popupWindow.style.transform || '';

function applySavedGalleryLayout(savedThumbs) {
  const cfg = { ...DEFAULT_GALLERY_LAYOUT, ...savedThumbs };
  document.documentElement.style.setProperty('--gallery-thumb-width', `${cfg.width}px`);
  document.documentElement.style.setProperty('--gallery-thumb-height', `${cfg.height}px`);
  document.documentElement.style.setProperty('--gallery-gap-x', `${cfg.gapX}px`);
  document.documentElement.style.setProperty('--gallery-gap-y', `${cfg.gapY}px`);
}

function applySavedTitleLayout(savedTitles = {}) {
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    const key = thumb.dataset.gallery;
    const title = thumb.querySelector('.gallery-thumb-window-title');
    if (!key || !title) return;
    const cfg = { x: 0, y: 0, scale: 1, ...(savedTitles[key] || {}) };
    title.style.transform = `translate(${cfg.x}px, ${cfg.y}px) scale(${cfg.scale})`;
  });
}


// ── MENUS ─────────────────────────────────────────
const navMenus = document.querySelectorAll('.nav-menu');

navMenus.forEach(menu => {
  menu.querySelector('.nav-menu-trigger').addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = menu.classList.contains('open');
    navMenus.forEach(m => m.classList.remove('open'));
    if (!wasOpen) menu.classList.add('open');
  });
});

document.addEventListener('click', () => navMenus.forEach(m => m.classList.remove('open')));


// ── SECTION NAVIGATION ───────────────────────────
function scrollToGalleries() {
  gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const scrollCue = document.getElementById('scroll-cue');
if (scrollCue) scrollCue.addEventListener('click', scrollToGalleries);


// ── SHARED ACTIONS ───────────────────────────────
function doAction(action, href, galleryKey, triggerEl) {
  if (href) {
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      window.location.href = href;
    } else {
      window.open(href, '_blank');
    }
    return;
  }

  switch (action) {
    case 'portfolio':
      openGallery('portfolio');
      break;
    case 'scroll-galleries':
      scrollToGalleries();
      break;
    case 'about':
      openAbout();
      break;
    case 'open-gallery':
      openGallery(galleryKey, triggerEl);
      break;
    case 'instagram':
      window.open('https://instagram.com', '_blank');
      break;
    case 'email':
    case 'contact':
      window.location.href = 'mailto:hello@adventuresofnickyj.com';
      break;
    default:
      break;
  }
}

document.querySelectorAll('.dock-icon').forEach(icon => {
  icon.addEventListener('click', () => doAction(icon.dataset.action, icon.dataset.href, null, icon));
});

document.querySelectorAll('.dropdown-item:not(.inactive)').forEach(item => {
  item.addEventListener('click', () => {
    doAction(item.dataset.action, item.dataset.href, item.dataset.gallery, item);
  });
});

document.querySelectorAll('.gallery-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => openGallery(thumb.dataset.gallery, thumb));
});


// ── GALLERY DATA ─────────────────────────────────
function loadGalleryImages(config) {
  const max = config.max || GALLERY_MAX;
  const ext = config.ext || '.jpg';
  const probes = Array.from({ length: max }, (_, i) => {
    const src = `${config.base}${String(i + 1).padStart(2, '0')}${ext}`;
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  });
  return Promise.all(probes).then(results => results.filter(Boolean));
}

async function getGallerySlides(key) {
  const config = galleryConfig[key];
  if (!config) return [];
  if (!galleryState.cache[key]) {
    galleryState.cache[key] = loadGalleryImages(config);
  }
  return galleryState.cache[key];
}

Object.keys(galleryConfig).forEach(key => {
  getGallerySlides(key);
});

function renderSlides(slides) {
  popupContent.innerHTML = slides.map((src, index) =>
    `<img class="gallery-img${index === 0 ? ' active' : ''}" src="${src}" alt="">`
  ).join('');
}

function refreshSlides() {
  const slideEls = popupContent.querySelectorAll('.gallery-img');
  slideEls.forEach((slide, index) => {
    slide.classList.toggle('active', index === galleryState.currentSlide);
  });
  galleryCounter.textContent = slideEls.length
    ? `${galleryState.currentSlide + 1} / ${slideEls.length}`
    : '0 / 0';
}

function showSlide(nextIndex) {
  const total = galleryState.slides.length;
  if (!total) return;
  galleryState.currentSlide = (nextIndex + total) % total;
  refreshSlides();
}

function getThumbRect(sourceEl) {
  const frame = sourceEl && sourceEl.querySelector
    ? sourceEl.querySelector('.gallery-thumb-window')
    : null;
  const target = frame || sourceEl;
  return target ? target.getBoundingClientRect() : null;
}

function hideSourceThumb() {
  if (galleryState.sourceThumb) {
    galleryState.sourceThumb.classList.add('is-source-hidden');
  }
}

function showSourceThumb() {
  if (galleryState.sourceThumb) {
    galleryState.sourceThumb.classList.remove('is-source-hidden');
  }
}

function getPopupRect() {
  return popupWindow.getBoundingClientRect();
}

function createMorphWindow(markup, rect, extraClass = '') {
  const morph = document.createElement('div');
  morph.className = `gallery-morph-window ${extraClass}`.trim();
  morph.innerHTML = markup;
  morph.style.left = `${rect.left}px`;
  morph.style.top = `${rect.top}px`;
  morph.style.width = `${rect.width}px`;
  morph.style.height = `${rect.height}px`;
  document.body.appendChild(morph);
  return morph;
}

function animateMorph(morph, targetRect, onDone, duration = 280) {
  morph.style.transition = 'none';
  morph.getBoundingClientRect();
  morph.style.transition = `left ${duration}ms ease, top ${duration}ms ease, width ${duration}ms ease, height ${duration}ms ease, opacity 180ms ease`;
  morph.style.left = `${targetRect.left}px`;
  morph.style.top = `${targetRect.top}px`;
  morph.style.width = `${targetRect.width}px`;
  morph.style.height = `${targetRect.height}px`;
  window.setTimeout(() => {
    morph.remove();
    if (onDone) onDone();
  }, duration + 30);
}

function animatePopupOpen(sourceEl) {
  const sourceRect = getThumbRect(sourceEl);
  if (!sourceRect) return;
  const sourceWindow = sourceEl.querySelector('.gallery-thumb-window');
  if (!sourceWindow) return;

  popupOverlay.classList.add('is-transparent');
  popupWindow.classList.add('is-hidden-for-morph');
  popupWindow.classList.remove('arrows-in');
  hideSourceThumb();
  const targetRect = getPopupRect();
  const morph = createMorphWindow(sourceWindow.outerHTML, sourceRect, 'gallery-morph-thumb');

  requestAnimationFrame(() => {
    popupOverlay.classList.remove('is-transparent');
    animateMorph(morph, targetRect, () => {
      popupWindow.classList.remove('is-hidden-for-morph');
      // arrows fade in out of the images once the window has settled
      window.setTimeout(() => popupWindow.classList.add('arrows-in'), 80);
    }, 300);
  });
}

function animatePopupClose() {
  if (galleryState.closing) return;
  const sourceThumb = galleryState.sourceThumb;
  const sourceRect = getThumbRect(sourceThumb);
  const sourceWindow = sourceThumb ? sourceThumb.querySelector('.gallery-thumb-window') : null;

  if (!sourceRect || !sourceWindow) {
    popupWindow.classList.remove('arrows-in');
    popupOverlay.classList.remove('open');
    popupOverlay.classList.remove('is-transparent');
    showSourceThumb();
    return;
  }

  galleryState.closing = true;

  // 1) arrows fade back into the gallery first
  popupWindow.classList.add('arrows-out');
  popupWindow.classList.remove('arrows-in');

  window.setTimeout(() => {
    // 2) swap the maximized window for the thumb art and shrink it home.
    //    NEVER morph a clone of the popup itself: its children have fixed
    //    pixel offsets and don't scale with the box (that was the distortion bug).
    const startRect = getPopupRect();
    const morph = createMorphWindow(sourceWindow.outerHTML, startRect, 'gallery-morph-thumb');
    popupWindow.classList.add('is-hidden-for-morph');

    requestAnimationFrame(() => {
      popupOverlay.classList.add('is-transparent');
      animateMorph(morph, sourceRect, () => {
        popupOverlay.classList.remove('open');
        popupOverlay.classList.remove('is-transparent');
        popupWindow.classList.remove('is-hidden-for-morph');
        popupWindow.classList.remove('arrows-out');
        showSourceThumb();
        galleryState.closing = false;
      }, 280);
    });
  }, 200);
}

async function openGallery(key, sourceEl) {
  if (!galleryConfig[key] || galleryState.closing) return;

  const slides = await getGallerySlides(key);
  if (!slides.length) return;

  galleryState.currentKey = key;
  galleryState.currentSlide = 0;
  galleryState.slides = slides;
  showSourceThumb();
  galleryState.sourceThumb = sourceEl && sourceEl.classList.contains('gallery-thumb')
    ? sourceEl
    : document.querySelector(galleryConfig[key].thumbSelector);

  popupTitle.textContent = galleryConfig[key].title;
  applyPopupFrame(galleryConfig[key]);
  renderSlides(slides);
  refreshSlides();
  popupOverlay.classList.add('open');

  if (galleryState.sourceThumb) {
    animatePopupOpen(galleryState.sourceThumb);
  } else {
    // No thumb to morph from (edit-mode preview, legacy 'portfolio' action):
    // show the window directly and fade the arrows in.
    popupWindow.classList.remove('is-hidden-for-morph');
    window.setTimeout(() => popupWindow.classList.add('arrows-in'), 80);
  }
}

function closeGallery() {
  if (!popupOverlay.classList.contains('open')) return;
  animatePopupClose();
}

window.openGallery = openGallery;
window.closeGallery = closeGallery;

document.getElementById('arrow-left').addEventListener('click', () => showSlide(galleryState.currentSlide - 1));
document.getElementById('arrow-right').addEventListener('click', () => showSlide(galleryState.currentSlide + 1));
document.getElementById('popup-close').addEventListener('click', closeGallery);

document.addEventListener('keydown', e => {
  if (popupOverlay.classList.contains('open')) {
    if (e.key === 'ArrowRight') showSlide(galleryState.currentSlide + 1);
    if (e.key === 'ArrowLeft') showSlide(galleryState.currentSlide - 1);
    if (e.key === 'Escape') closeGallery();
  }
  if (document.getElementById('popup-about').classList.contains('open') && e.key === 'Escape') {
    closeAbout();
  }
});


// ── ABOUT ME POPUP ────────────────────────────────
function openAbout() {
  document.getElementById('popup-about').classList.add('open');
}

function closeAbout() {
  document.getElementById('popup-about').classList.remove('open');
}

document.getElementById('about-close').addEventListener('click', closeAbout);
