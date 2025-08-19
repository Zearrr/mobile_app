import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

function getInitialIsDark(): boolean {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(getInitialIsDark());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="hover:bg-accent rounded-full p-2"
      title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Moon className="w-5 h-5 text-muted-foreground" />
      )}
    </Button>
  );
}


