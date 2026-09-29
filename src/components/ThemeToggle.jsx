import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Sun/moon theme toggle. Uses ThemeContext.
 * @param {{ className?: string; size?: number }} props
 */
export default function ThemeToggle({ className = '', size = 20 }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex items-center justify-center rounded-lg p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${className}`}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
