const navMenus = document.querySelectorAll('.nav-menu');
const homeLink = document.querySelector('.menubar-brand')?.getAttribute('href') || '../index.html';
const onHomepage = Boolean(document.getElementById('stage'));

navMenus.forEach(menu => {
  const trigger = menu.querySelector('.nav-menu-trigger');

  if (!trigger) return;

  trigger.addEventListener('click', event => {
    event.stopPropagation();

    const wasOpen = menu.classList.contains('open');
    navMenus.forEach(item => item.classList.remove('open'));

    if (!wasOpen) menu.classList.add('open');
  });
});

document.addEventListener('click', () => {
  navMenus.forEach(menu => menu.classList.remove('open'));
});

document.querySelectorAll('.dropdown-item:not(.inactive)').forEach(item => {
  item.addEventListener('click', event => {
    event.stopPropagation();

    const href = item.dataset.href;
    const action = item.dataset.action;
    const gallery = item.dataset.gallery;

    if (href && !href.startsWith('__')) {
      window.location.href = href;
      return;
    }

    if (action === 'open-gallery') {
      if (onHomepage && typeof window.openGallery === 'function') {
        window.openGallery(gallery);
      } else {
        window.location.href = `${homeLink}?gallery=${encodeURIComponent(gallery)}`;
      }
      return;
    }

    if (action === 'scroll-galleries') {
      if (onHomepage) {
        document.getElementById('galleries')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        window.location.href = `${homeLink}#galleries`;
      }
      return;
    }

    if (action === 'about') {
      if (onHomepage && typeof window.openAbout === 'function') {
        window.openAbout();
      } else {
        window.location.href = homeLink;
      }
      return;
    }

    if (action === 'email') {
      window.location.href = 'mailto:hello@adventuresofnickyj.com';
      return;
    }

    if (action === 'instagram') {
      window.open('https://instagram.com', '_blank');
    }
  });
});

const clock = document.getElementById('clock');

if (clock) {
  const updateClock = () => {
    const now = new Date();
    clock.textContent =
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');
  };

  updateClock();
  setInterval(updateClock, 30000);
}
