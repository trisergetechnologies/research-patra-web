import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

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

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return getSystemTheme();
}

/** Keep Tailwind dark: class AND CSS tokens in lockstep — prevents dark-on-dark text */
function applyTheme(theme) {
  const root = document.documentElement;
  const vars = theme === 'dark' ? DARK_VARS : LIGHT_VARS;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const initial = getInitialTheme();
    if (typeof document !== 'undefined') applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    const resolved = next === 'dark' ? 'dark' : 'light';
    applyTheme(resolved);
    setThemeState(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
