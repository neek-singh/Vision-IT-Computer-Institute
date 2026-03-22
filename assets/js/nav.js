/**
 * ════════════════════════════════════════════
 * nav.js — Vision IT Computer Institute
 * Shared navbar: active state, mobile menu,
 * dropdowns, scroll hide, auth state display
 * ════════════════════════════════════════════
 */

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// ── Current page detection (from filename) ──
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('courses'))    return 'courses';
  if (path.includes('admission'))  return 'admission';
  if (path.includes('contact'))    return 'contact';
  if (path.includes('blog'))       return 'blog';
  if (path.includes('gallery'))    return 'gallery';
  if (path.includes('about'))      return 'about';
  if (path.includes('results'))    return 'results';
  if (path.includes('certificate'))return 'certificate';
  if (path.includes('privacy'))    return 'privacy';
  if (path.includes('terms'))      return 'terms';
  if (path.includes('admin'))      return 'admin';
  return 'home';
}

// ── Set active nav link ──
export function setActiveNav(page) {
  document.querySelectorAll('.nav-link, .mob-nav-link').forEach(el => {
    el.classList.remove('active');
  });
  const active = document.getElementById(`nav-${page}`);
  if (active) active.classList.add('active');
}

// ── Mobile menu ──
export function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobMenu   = document.getElementById('mob-menu');
  const overlay   = document.getElementById('mob-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobMenu?.classList.toggle('open');
      overlay?.classList.toggle('open');
    });
  }

  overlay?.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

export function closeMobileMenu() {
  document.getElementById('mob-menu')?.classList.remove('open');
  document.getElementById('mob-overlay')?.classList.remove('open');
}
window.closeMob = closeMobileMenu;

// ── Nav dropdowns ──
export function initDropdowns() {
  document.addEventListener('click', e => {
    if (!e.target.closest('#nav-more-wrap') && !e.target.closest('#nav-portal-wrap')) {
      closeNavDropdowns();
    }
  });
}

export function toggleNavDropdown(id) {
  const dropdowns = ['more-dropdown', 'portal-dropdown'];
  dropdowns.forEach(d => {
    if (d !== id) document.getElementById(d)?.classList.add('hidden');
  });
  document.getElementById(id)?.classList.toggle('hidden');
}
window.toggleNavDropdown = toggleNavDropdown;

export function closeNavDropdowns() {
  ['more-dropdown', 'portal-dropdown'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
}
window.closeNavDropdowns = closeNavDropdowns;

// ── Scroll: hide/show navbar + scroll progress ──
export function initScrollBehavior() {
  const navbar  = document.getElementById('navbar');
  const progBar = document.getElementById('scroll-prog');
  let lastY     = 0;
  let ticking   = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Hide/show
        if (y > lastY && y > 80) {
          navbar?.classList.add('hidden-nav');
        } else {
          navbar?.classList.remove('hidden-nav');
        }
        navbar?.classList.toggle('scrolled', y > 10);
        lastY = y;

        // Scroll progress bar
        if (progBar) {
          const total  = document.documentElement.scrollHeight - window.innerHeight;
          const pct    = total > 0 ? (y / total) * 100 : 0;
          progBar.style.width = pct + '%';
        }

        ticking = false;
      });
      ticking = true;
    }
  });
}

// ── Auth state → update nav UI ──
export function initAuthNav() {
  onAuthStateChanged(auth, user => {
    const loginBtn    = document.getElementById('nav-login-btn');
    const userWrap    = document.getElementById('nav-user-wrap');
    const mobLoginBtn = document.getElementById('mob-login-btn');
    const mobUserRow  = document.getElementById('mob-user-row');
    const navUname    = document.getElementById('nav-uname');
    const navAvatarTxt= document.getElementById('nav-avatar-txt');
    const navAvatarImg= document.getElementById('nav-avatar-img');
    const navAvatarPhoto = document.getElementById('nav-avatar-photo');

    if (user) {
      loginBtn?.classList.add('hidden');
      userWrap?.classList.remove('hidden');
      userWrap?.classList.add('flex');
      mobLoginBtn?.classList.add('hidden');
      mobUserRow?.classList.remove('hidden');
      mobUserRow?.classList.add('flex');

      const name = user.displayName || user.email?.split('@')[0] || 'User';
      if (navUname) navUname.textContent = name;
      if (navAvatarTxt) navAvatarTxt.textContent = name[0].toUpperCase();

      if (user.photoURL && navAvatarImg && navAvatarPhoto) {
        navAvatarPhoto.src = user.photoURL;
        navAvatarImg.classList.remove('hidden');
        navAvatarTxt?.classList.add('hidden');
      }
    } else {
      loginBtn?.classList.remove('hidden');
      userWrap?.classList.add('hidden');
      userWrap?.classList.remove('flex');
      mobLoginBtn?.classList.remove('hidden');
      mobUserRow?.classList.add('hidden');
    }

    // Expose current user globally for other modules
    window.VIT_USER = user;
  });
}

// ── Long-press logo → admin (3 seconds) ──
export function initLogoLongPress() {
  let timer    = null;
  let held     = false;
  const logo   = document.getElementById('logo-btn');
  if (!logo) return;

  const start = e => {
    if (e.preventDefault) e.preventDefault();
    held = false;
    logo.style.opacity = '.6';
    timer = setTimeout(() => {
      held = true;
      logo.style.opacity = '';
      window.location.href = '/admin.html';
    }, 3000);
  };

  const cancel = () => {
    clearTimeout(timer);
    logo.style.opacity = '';
  };

  logo.addEventListener('mousedown',    start);
  logo.addEventListener('mouseup',      cancel);
  logo.addEventListener('mouseleave',   cancel);
  logo.addEventListener('touchstart',   start,  { passive: false });
  logo.addEventListener('touchend',     cancel);
  logo.addEventListener('touchcancel',  cancel);

  logo.addEventListener('click', () => {
    if (!held) window.location.href = '/';
    held = false;
  });
}

// ── Top Banner ──
export async function initTopBanner(loadBannerSettings) {
  const banner    = document.getElementById('top-banner');
  const bannerTxt = document.getElementById('top-banner-text');
  const bannerCta = document.getElementById('top-banner-cta');
  const bannerCd  = document.getElementById('top-banner-cd');
  if (!banner) return;

  if (sessionStorage.getItem('top-banner-dismissed') === '1') {
    banner.style.display = 'none';
    return;
  }

  const data = await loadBannerSettings();
  if (!data || !data.active || !data.text) {
    banner.style.display = 'none';
    return;
  }

  // Date check
  const now = Date.now();
  if (data.startDate?.toMillis && now < data.startDate.toMillis()) { banner.style.display = 'none'; return; }
  if (data.endDate?.toMillis   && now > data.endDate.toMillis())   { banner.style.display = 'none'; return; }

  if (bannerTxt) bannerTxt.textContent = data.text;

  // CTA button
  if (bannerCta && data.ctaText) {
    bannerCta.textContent = data.ctaText;
    bannerCta.onclick = () => {
      const action = data.ctaAction || '';
      if      (action === 'admission') window.location.href = '/admission.html';
      else if (action === 'contact')   window.location.href = '/contact.html';
      else if (action === 'courses')   window.location.href = '/courses.html';
      else if (action.startsWith('http')) window.open(action, '_blank');
      else window.location.href = '/admission.html';
    };
  }

  // Theme
  if (data.theme) banner.dataset.theme = data.theme;

  // Countdown
  if (data.showCountdown && data.endDate?.toMillis && bannerCd) {
    bannerCd.style.display = 'inline-flex';
    const tick = () => {
      const diff = data.endDate.toMillis() - Date.now();
      if (diff <= 0) { bannerCd.style.display = 'none'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const el = id => document.getElementById(id);
      if (el('bcd-d')) el('bcd-d').textContent = String(d).padStart(2,'0');
      if (el('bcd-h')) el('bcd-h').textContent = String(h).padStart(2,'0');
      if (el('bcd-m')) el('bcd-m').textContent = String(m).padStart(2,'0');
      if (el('bcd-s')) el('bcd-s').textContent = String(s).padStart(2,'0');
    };
    tick();
    setInterval(tick, 1000);
  } else if (bannerCd) {
    bannerCd.style.display = 'none';
  }

  banner.style.display = 'flex';

  // Dismiss
  document.getElementById('top-banner-close')?.addEventListener('click', () => {
    banner.style.display = 'none';
    sessionStorage.setItem('top-banner-dismissed', '1');
  });
}

// ── Init all nav features ──
export function initNav() {
  setActiveNav(getCurrentPage());
  initMobileMenu();
  initDropdowns();
  initScrollBehavior();
  initAuthNav();
  initLogoLongPress();
}
