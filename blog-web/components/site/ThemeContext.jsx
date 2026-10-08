'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

const ThemeContext = createContext(null);

// Same key as the main site, so the choice carries across both apps on one domain.
const STORAGE_KEY = 'theme';

const LIGHT_VARS = {
  '--page': '255 255 255',
  '--surface': '255 255 255',
  '--body': '15 23 42',
  '--muted': '100 116 139',
  '--border': '226 232 240',
  '--soft': '248 250 252',
  '--badge': '255 247 237',
  '--scroll-track': '#F8FAFC',
  '--border-solid': '#E2E8F0',
  '--badge-solid': '#FFF7ED',
};

const DARK_VARS = {
  '--page': '11 18 32',
  '--surface': '17 24 39',
  '--body': '248 250 252',
  '--muted': '203 213 225',
  '--border': '255 255 255',
  '--soft': '15 23 42',
  '--badge': '249 115 22',
  '--scroll-track': '#0F172A',
  '--border-solid': 'rgba(255, 255, 255, 0.10)',
  '--badge-solid': 'rgba(249, 115, 22, 0.15)',
};

function applyTheme(theme) {
  const root = document.documentElement;
  const vars = theme === 'dark' ? DARK_VARS : LIGHT_VARS;
  root.classList.toggle('dark', theme === 'dark');
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}

// The inline script in <head> applies the theme before paint; React reads it from the <html> class.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
const getSnapshot = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
const getServerSnapshot = () => 'light';

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next) => {
    const resolved = next === 'dark' ? 'dark' : 'light';
    applyTheme(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => setTheme(getSnapshot() === 'dark' ? 'light' : 'dark'), [setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
