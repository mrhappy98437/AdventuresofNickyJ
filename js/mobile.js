/* ═══════════════════════════════════════════════════════
   The Adventures of Nicky J — Mobile App  v1
   Single-page app: Home · Galleries · Gallery
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Gallery registry ─────────────────────────────── */
  const GALLERIES = [
    {
      id: 'street',
      label: 'Street',
      desc: 'Urban stories & city light',
      path: 'images/galleries/street/street-',
      ext: '.jpg',
      max: 20,
      icon: 'images/ui/mobile/categories/street.png',
    },
    {
      id: 'portrait',
      label: 'Portraits',
      desc: 'Faces, stories, light',
      path: 'images/galleries/portrait/portrait-',
      ext: '.jpg',
      max: 20,
      icon: 'images/ui/mobile/categories/portrait.png',
    },
    {
      id: 'landscape',
      label: 'Landscape',
      desc: 'Open skies & wide places',
      path: 'images/galleries/landscape/landscape-',
      ext: '.jpg',
      max: 20,
      icon: 'images/ui/mobile/categories/landscape.png',
    },
    {
      id: 'wedding',
      label: 'Weddings',
      desc: 'Love in golden light',
      path: 'images/galleries/wedding/wedding-',
      ext: '.jpg',
      max: 20,
      icon: 'images/ui/mobile/categories/wedding.png',
    },
  ];

  /* ── State ──────────────────────────────────────────── */
  let currentScreen   = 'home';
  let currentGallery  = null;
  let galleryBackScreen = 'galleries';
  let bgIndex         = 0;
  let transitioning   = false;
  const CARD_ROTATIONS = [-2.4, 1.8, -1.2, 2.1];

  const BG_IMAGES = [
    'images/backgrounds/mobile/mobile-bg-01.png',
    'images/backgrounds/mobile/mobile-bg-02.png',
    'images/backgrounds/mobile/mobile-bg-03.png',
    'images/backgrounds/mobile/mobile-bg-04.png',
  ];
  /* Galleries-overview cover art: one per gallery, named cover-<gallery id>.png */
  const galleryCoverArt = id => `images/galleries/mobile-covers/cover-${id}.png`;
  const HOME_CATEGORY_TILES = [
    { id: 'street', label: 'Street', tile: 'images/ui/mobile/categories/street.png', type: 'gallery' },
    { id: 'wedding', label: 'Weddings', tile: 'images/ui/mobile/categories/wedding.png', type: 'gallery' },
    { id: 'portrait', label: 'Portraits', tile: 'images/ui/mobile/categories/portrait.png', type: 'gallery' },
    { id: 'landscape', label: 'Landscape', tile: 'images/ui/mobile/categories/landscape.png', type: 'gallery' },
    { id: 'design', label: 'Design', tile: 'images/ui/mobile/categories/design.png', type: 'stub' },
    { id: 'websites', label: 'Websites', tile: 'images/ui/mobile/categories/websites.png', type: 'stub' },
    { id: 'video', label: 'Video', tile: 'images/ui/mobile/categories/video.png', type: 'stub' },
  ];

  /* ── DOM refs ───────────────────────────────────────── */
  const screens = {
    home:      document.getElementById('m-home'),
    galleries: document.getElementById('m-galleries'),
    gallery:   document.getElementById('m-gallery'),
  };
  const bgContainer    = document.getElementById('m-bg-container');
  const navItems       = document.querySelectorAll('.m-nav-item');
  const heroCard       = document.querySelector('.m-hero');
  const galleryTitle   = document.getElementById('m-gallery-title');
  const galleryScroll  = document.getElementById('m-gallery-scroll');
  const galleriesList  = document.getElementById('m-galleries-list');
  const catGrid        = document.getElementById('m-cat-grid');
  const aboutSheet     = document.getElementById('m-about-sheet');
  const sheetBackdrop  = document.getElementById('m-sheet-backdrop');

  /* ══════════════════════════════════════════════════════
     BACKGROUND CYCLING
  ══════════════════════════════════════════════════════ */
  function initBg() {
    BG_IMAGES.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'm-bg-slide' + (i === 0 ? ' active' : '');
      div.style.backgroundImage = `url('${src}')`;
      bgContainer.appendChild(div);
    });
    setInterval(cycleBg, 5000);
  }

  function cycleBg() {
    const slides = bgContainer.querySelectorAll('.m-bg-slide');
    slides[bgIndex].classList.remove('active');
    bgIndex = (bgIndex + 1) % slides.length;
    slides[bgIndex].classList.add('active');
    syncHeroSlide();
  }

  function syncHeroSlide() {
    /* Hero art is the finished top-window asset, set in CSS.
       Do NOT override it here with topwindow-background.png —
       that is only the raw sunset, not the framed hero window. */
  }

  /* ══════════════════════════════════════════════════════
     SCREEN NAVIGATION
  ══════════════════════════════════════════════════════ */
  // screenDepth: home=0, galleries=1, gallery=2
  const DEPTH = { home: 0, galleries: 1, gallery: 2 };

  function navigateTo(to, options = {}) {
    if (transitioning || to === currentScreen) return;
    transitioning = true;

    const from     = currentScreen;
    const fromEl   = screens[from];
    const toEl     = screens[to];
    const forward  = (DEPTH[to] > DEPTH[from]) || options.force === 'forward';

    const enterClass = forward ? 'entering-fwd'  : 'entering-back';
    const leaveClass = forward ? 'leaving-fwd'   : 'leaving-back';

    if (to !== 'home') {
      updateChrome(to);
    }

    toEl.classList.add('active', enterClass);
    fromEl.classList.add(leaveClass);

    const DURATION = 320;
    setTimeout(() => {
      fromEl.classList.remove('active', leaveClass);
      toEl.classList.remove(enterClass);
      transitioning  = false;
      currentScreen  = to;
      updateChrome(to);
      updateNav(to);
    }, DURATION);
  }

  function updateNav(active) {
    navItems.forEach(btn => {
      const isActive = btn.dataset.screen === active || 
                       (active === 'gallery' && btn.dataset.screen === 'galleries');
      btn.classList.toggle('active', isActive);
    });
  }

  function updateChrome(active) {
    bgContainer.classList.toggle('visible', active !== 'home');
  }

  /* ══════════════════════════════════════════════════════
     BOTTOM NAV WIRING
  ══════════════════════════════════════════════════════ */
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      // Bounce animation
      btn.classList.remove('tapped');
      void btn.offsetWidth; // reflow
      btn.classList.add('tapped');
      setTimeout(() => btn.classList.remove('tapped'), 350);

      const target = btn.dataset.screen;
      if (btn.classList.contains('stub')) return;

      if (target === 'home') {
        // Always go home from root
        if (currentScreen !== 'home') navigateTo('home');
      } else if (target === 'galleries') {
        if (currentScreen === 'gallery') navigateTo('galleries');
        else if (currentScreen !== 'galleries') navigateTo('galleries');
      }
    });
  });

  /* ══════════════════════════════════════════════════════
     GALLERY PROBE — same convention as desktop
     Images named "<gallery>-01.jpg" → "<gallery>-NN.jpg" (zero-padded)
  ══════════════════════════════════════════════════════ */
  function probeImages(gallery) {
    const probes = Array.from({ length: gallery.max }, (_, i) => {
      const src = gallery.path + String(i + 1).padStart(2, '0') + gallery.ext;
      return new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve({ n: i + 1, src });
        img.onerror = () => resolve(null);
        img.src = src;
      });
    });
    return Promise.all(probes).then(r => r.filter(Boolean));
  }

  /* ══════════════════════════════════════════════════════
     GALLERIES OVERVIEW — phone card assets
  ══════════════════════════════════════════════════════ */
  function buildGalleryCards() {
    galleriesList.innerHTML = '';

    GALLERIES.forEach((gallery, index) => {
      const card = document.createElement('button');
      card.className = 'm-gallery-card';
      card.style.setProperty('--card-rotate', `${CARD_ROTATIONS[index % CARD_ROTATIONS.length]}deg`);
      const cardArt = galleryCoverArt(gallery.id);
      card.innerHTML = `
        <span class="m-gallery-card-visual${cardArt ? ' has-art' : ''}">
          ${cardArt
            ? `<img class="m-gallery-card-art" src="${cardArt}" alt="${gallery.label}" loading="lazy">`
            : `<img class="m-gallery-card-photo loading" src="" alt="${gallery.label}" loading="lazy">
               <img class="m-gallery-card-frame" src="images/ui/mobile/gallery-frame-square.png" alt="">`
          }
        </span>
        <span class="m-gallery-card-meta">
          <span class="m-gallery-card-title">${gallery.label}</span>
          <span class="m-gallery-card-count">Loading…</span>
        </span>
      `;

      card.addEventListener('click', () => openGallery(gallery.id, { backTo: 'galleries' }));
      galleriesList.appendChild(card);

      const imgEl   = card.querySelector('.m-gallery-card-photo');
      const countEl = card.querySelector('.m-gallery-card-count');

      probeImages(gallery).then(results => {
        if (imgEl && results.length > 0) {
          imgEl.src = results[0].src;
          imgEl.onload = () => imgEl.classList.remove('loading');
          imgEl.onerror = () => imgEl.classList.remove('loading');
        } else if (imgEl) {
          imgEl.classList.remove('loading');
        }
        countEl.textContent = results.length > 0 ? results.length + ' images' : 'Coming soon';
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     OPEN & LOAD GALLERY
  ══════════════════════════════════════════════════════ */
  function openGallery(id, options = {}) {
    const gallery = GALLERIES.find(g => g.id === id);
    if (!gallery) return;
    currentGallery = gallery;
    galleryBackScreen = options.backTo || currentScreen || 'galleries';

    // Update header title
    galleryTitle.textContent = gallery.label.toUpperCase();

    // Reset scroll
    galleryScroll.scrollTop = 0;
    galleryScroll.innerHTML = `<div class="m-gallery-loading">Loading gallery…</div>`;

    // Navigate to gallery screen
    navigateTo('gallery');

    // Load images
    probeImages(gallery).then(results => {
      galleryScroll.innerHTML = '';

      if (results.length === 0) {
        galleryScroll.innerHTML = `<div class="m-gallery-loading">No images found</div>`;
        return;
      }

      // IntersectionObserver for lazy fade-in
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px 100px 0px', threshold: 0.05 });

      results.forEach((item, i) => {
        const wrap = document.createElement('div');
        wrap.className = 'm-gallery-img-wrap';
        const img = document.createElement('img');
        img.className = 'm-gallery-img';
        img.src = item.src;
        img.alt = gallery.label + ' ' + item.n;
        img.loading = 'lazy';

        const num = document.createElement('span');
        num.className = 'm-gallery-img-num';
        num.textContent = (i + 1) + ' / ' + results.length;

        wrap.appendChild(img);
        wrap.appendChild(num);
        galleryScroll.appendChild(wrap);
        observer.observe(img);
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     HOME CATEGORY GRID
  ══════════════════════════════════════════════════════ */
  function buildCategoryGrid() {
    catGrid.innerHTML = '';
    HOME_CATEGORY_TILES.forEach(tile => {
      const item = document.createElement('button');
      item.className = `m-cat-item${tile.type === 'stub' ? ' is-static' : ''}`;
      item.type = 'button';
      item.innerHTML = `<img src="${tile.tile}" alt="${tile.label}" loading="lazy">`;
      if (tile.type === 'gallery') {
        item.addEventListener('click', () => openGallery(tile.id, { backTo: 'home' }));
      } else {
        item.setAttribute('aria-disabled', 'true');
      }
      catGrid.appendChild(item);
    });
  }

  /* ══════════════════════════════════════════════════════
     ABOUT SHEET
  ══════════════════════════════════════════════════════ */
  function openAbout() {
    aboutSheet.classList.add('open');
    sheetBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeAbout() {
    aboutSheet.classList.remove('open');
    sheetBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  sheetBackdrop.addEventListener('click', closeAbout);
  document.getElementById('m-about-close').addEventListener('click', closeAbout);

  /* ── Home quick icon actions ──────────────────────── */
  document.querySelectorAll('.m-qi-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'about')      openAbout();
      if (action === 'galleries')  navigateTo('galleries');
      if (action === 'instagram') window.open('https://instagram.com', '_blank');
      if (action === 'contact')   window.location.href = 'mailto:hello@adventuresofnickyj.com';
    });
  });

  /* ── CTA & View All ───────────────────────────────── */
  document.getElementById('m-cta-btn').addEventListener('click', () => navigateTo('galleries'));
  document.getElementById('m-view-all').addEventListener('click', () => navigateTo('galleries'));

  /* ── Back buttons ─────────────────────────────────── */
  document.getElementById('m-galleries-back').addEventListener('click', () => navigateTo('home'));
  document.getElementById('m-gallery-back').addEventListener('click', () => {
    navigateTo(galleryBackScreen);
    // Reset gallery state
    currentGallery = null;
    galleryBackScreen = 'galleries';
  });

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    initBg();
    syncHeroSlide();
    buildCategoryGrid();
    buildGalleryCards();

    // Set home as active
    screens.home.classList.add('active');
    updateChrome('home');
    updateNav('home');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
