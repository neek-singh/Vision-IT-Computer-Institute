/**
 * ════════════════════════════════════════════
 * theme.js — Vision IT Computer Institute
 * Dark / Light mode toggle with localStorage persistence
 * ════════════════════════════════════════════
 */

const STORAGE_KEY = 'vit-theme';
const ROOT        = document.documentElement;

// ── Apply theme immediately (run before DOMContentLoaded to prevent FOUC) ──
const saved = localStorage.getItem(STORAGE_KEY) || 'light';
ROOT.setAttribute('data-theme', saved);

/** Toggle between light and dark */
export function toggleTheme() {
  const current = ROOT.getAttribute('data-theme') || 'light';
  const next    = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}
window.toggleTheme = toggleTheme;

/** Set a specific theme */
export function setTheme(theme) {
  ROOT.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  syncThemeButton(theme);
}

/** Sync all theme toggle buttons to correct icon/label */
function syncThemeButton(theme) {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const icon  = btn.querySelector('i');
    const label = btn.querySelector('[data-theme-label]');
    if (icon)  icon.className  = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  });
}

/** Get current theme */
export function getTheme() {
  return ROOT.getAttribute('data-theme') || 'light';
}

// ── Init: wire up all toggle buttons after DOM ready ──
export function initTheme() {
  syncThemeButton(getTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}
