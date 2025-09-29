import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = mode === 'dark' || (mode === 'system' && prefersDark);
  if (shouldUseDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme());

  // Apply theme and persist selection
  useEffect(() => {
    applyTheme(mode);
    try { localStorage.setItem('theme', mode); } catch {}
  }, [mode]);

  // Sync with system changes only when in "system" mode
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (mode === 'system') applyTheme('system');
    };
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, [mode]);

  const Icon = useMemo(() => {
    if (mode === 'light') return Sun;
    if (mode === 'dark') return Moon;
    return Monitor;
  }, [mode]);

  const title = mode === 'light' ? 'โหมดสว่าง' : mode === 'dark' ? 'โหมดมืด' : 'ตามระบบ';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-accent rounded-full p-2"
          aria-label="Theme menu"
          title={title}
        >
          <Icon className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setMode('light')}>
          <Sun className="w-4 h-4 mr-2" /> สว่าง
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('dark')}>
          <Moon className="w-4 h-4 mr-2" /> มืด
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('system')}>
          <Monitor className="w-4 h-4 mr-2" /> ตามระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


