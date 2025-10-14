import { useEffect, useState } from 'react';
import Button from './Button';

const STORAGE_KEY = 'theme.dark';

function applyDark(dark: boolean) {
  const root = document.documentElement;
  if (dark) root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored != null) return stored === '1';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyDark(dark);
    localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
  }, [dark]);

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Toggle dark mode"
      onClick={() => setDark((d) => !d)}
      className="gap-2"
      title="Toggle theme"
    >
      <span className="inline-block align-middle">{dark ? '🌙' : '☀️'}</span>
      <span className="hidden sm:inline">{dark ? 'Dark' : 'Light'}</span>
    </Button>
  );
}
