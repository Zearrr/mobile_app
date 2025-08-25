// Modern Sidebar Navigation
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  BarChart3,
  Calculator,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Users,
  Wallet
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navigation = [
  {
    name: 'หน้าแรก',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'จัดการสินค้า',
    href: '/parts',
    icon: Package
  },

  {
    name: 'รายรับ–รายจ่าย',
    href: '/cashbook',
    icon: Wallet
  },
  {
    name: 'ขาย (POS)',
    href: '/pos/sale',
    icon: Calculator
  },
  {
    name: 'ใบสั่งซื้อ (PO)',
    href: '/po',
    icon: Package
  },
  // หน้ารับของเข้าสต๊อกถูกลบออก

  {
    name: 'รับประกัน',
    href: '/warranty',
    icon: ShieldCheck
  },

  {
    name: 'รายงาน',
    href: '/reports',
    icon: BarChart3
  },
  {
    name: 'ผู้ใช้',
    href: '/users',
    icon: Users
  },
  {
    name: 'ตั้งค่า',
    href: '/settings',
    icon: Settings
  }
];

interface SidebarProps {
  className?: string;
  mobileOpen?: boolean; // control from parent for mobile
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ className, mobileOpen, setMobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const settings = useRepairStore(state => state.settings);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isExpanded = !collapsed || isHovered;

  // Click-outside to close on mobile when open
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile || collapsed) return;
    const onDocClick = (e: MouseEvent) => {
      const el = sidebarRef.current;
      if (el && !el.contains(e.target as Node)) {
        setCollapsed(true);
      }
    };
    document.addEventListener('click', onDocClick, { capture: true });
    return () => document.removeEventListener('click', onDocClick, { capture: true } as any);
  }, [collapsed]);

  // Auto-collapse by default on small screens
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (isMobile) setCollapsed(true);
  }, []);

  // Close on route change for mobile
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (isMobile) setCollapsed(true);
  }, [location.pathname]);

  // Sync collapsed with parent-controlled mobileOpen
  useEffect(() => {
    if (typeof mobileOpen !== 'boolean') return;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return;
    setCollapsed(!mobileOpen);
  }, [mobileOpen]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return;
    if (!collapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [collapsed]);

  // Adjust on viewport resize across breakpoint
  useEffect(() => {
    const listener = () => {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches;
      if (isMobile) {
        setCollapsed(true);
        setMobileOpen && setMobileOpen(false);
      } else {
        setCollapsed(false);
        setMobileOpen && setMobileOpen(false);
      }
    };
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [setMobileOpen]);

  // Close on ESC
  useEffect(() => {
    if (collapsed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCollapsed(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [collapsed]);

  return (
    <>
      {/* Mobile backdrop - visible only when sidebar is open on small screens */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          !collapsed ? "block" : "hidden"
        )}
        onClick={() => { setCollapsed(true); setMobileOpen && setMobileOpen(false); }}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-primary text-primary-foreground border-r border-primary-dark shadow-lg transition-all duration-500 ease-in-out overflow-hidden transform flex flex-col",
          // Mobile behavior: off-canvas when collapsed
          collapsed 
            ? "-translate-x-full w-64 border-transparent shadow-none pointer-events-none" 
            : "translate-x-0 w-64",
          // Desktop behavior: static, width depends on collapse
          "lg:translate-x-0 lg:static lg:z-auto",
          collapsed && "lg:w-24",
          !collapsed && "lg:w-64",
          className
        )}
        ref={sidebarRef}
        onMouseEnter={() => !collapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-dark bg-primary">
          <div className={cn(
            "flex items-center gap-4 transition-all duration-300",
            collapsed ? "opacity-0 lg:opacity-100" : "opacity-100"
          )}>
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
              <img src="/KODPHONELOGO.png" alt="logo" className="w-full h-full object-cover" />
            </div>
            {isExpanded && (
              <div className="text-md font-semibold text-white leading-5 truncate whitespace-nowrap max-w-[10rem]">
                {settings?.storeName || 'ระบบร้านซ่อมมือถือ'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded && <ThemeToggle />}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navigation
            .filter(item => {
              return true;
            })
            .map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 thai-text font-medium text-[14px] text-white/80",
                  "hover:bg-white/10 hover:text-white hover:shadow-sm",
                  isActive && "bg-white/20 text-white shadow-md",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => {
                  // Close sidebar after navigating on mobile
                  if (window.matchMedia('(max-width: 1023px)').matches) {
                    setCollapsed(true);
                    setMobileOpen && setMobileOpen(false);
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "flex-shrink-0 transition-all duration-300 w-5 h-5",
                      isActive && "text-white"
                    )} />
                    {isExpanded && (
                      <span className="truncate font-medium text-[14px]">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout footer */}
        <div className="mt-auto p-4 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-primary-dark/50">
          <Button
            variant="outline"
            className="w-full justify-center rounded-lg bg-white/10 border-white/20 text-white hover:bg-white/15 thai-text"
            onClick={() => {
              try { useRepairStore.getState().logout(); } catch {}
              window.location.href = '/login';
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* Floating toggle button when sidebar is collapsed */}
      {collapsed && (
        <Button
          variant="default"
          size="sm"
          onClick={toggleSidebar}
          className="fixed top-6 left-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 lg:hidden"
        >
          <Menu className="w-7 h-7" />
        </Button>
      )}
    </>
  );
}