/* ==========================================================================
   THEME MANAGER MODULE (theme.js)
   ========================================================================== */

const THEME_KEY = 'markdify_preferred_theme';
const THEME_KEY_LEGACY = 'devsuite_preferred_theme';

/**
 * Initializes the theme based on local storage preference or system configuration.
 * Migrates legacy devsuite key to markdify key for returning users.
 */
export function initTheme() {
  // Migrate legacy preference from devsuite era if new key is absent
  if (!localStorage.getItem(THEME_KEY)) {
    const legacyTheme = localStorage.getItem(THEME_KEY_LEGACY);
    if (legacyTheme === 'light' || legacyTheme === 'dark') {
      localStorage.setItem(THEME_KEY, legacyTheme);
      localStorage.removeItem(THEME_KEY_LEGACY);
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  
  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
  } else {
    // If no manual preference, auto-detect from system OS
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemPrefersDark ? 'dark' : 'light');
  }

  // Listen to OS level changes dynamically
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only apply system changes if the user hasn't overridden it manually
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Toggles between light and dark theme.
 */
export function toggleTheme() {
  // Temporary disable transitions to prevent blinking, add utility class
  document.documentElement.classList.add('theme-transition');

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);

  // Remove transition utility class after the normal duration finishes
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 350);

  return newTheme;
}

/**
 * Safely applies the theme attribute to the HTML tag.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
