// Modern Sidebar Navigation
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  Wrench
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

type NavChild = { name: string; href: string };
type NavItem = { name: string; href?: string; icon: any; children?: NavChild[] };

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
  const currentRole = useRepairStore(state => state.currentRole);
  // Build navigation based on role
  const navigation: NavItem[] = useMemo(() => {
    if (currentRole === 'owner') {
      return [
        { name: 'แดชบอร์ด', href: '/staff/dashboard', icon: LayoutDashboard },
        {
          name: 'แจ้งซ่อม',
          icon: Wrench,
          children: [
            { name: 'แจ้งซ่อมใหม่', href: '/jobs/new' },
            { name: 'รายการซ่อม', href: '/jobs' },
            { name: 'คำนวณราคา', href: '/pricing' }
          ]
        },
        {
          name: 'ร้านค้า',
          icon: Package,
          children: [
            { name: 'ขาย (POS)', href: '/pos/sale' },
            { name: 'ประวัติการขาย', href: '/sales/history' },
            { name: 'จัดการสินค้า', href: '/parts' },
            { name: 'ประวัติสต๊อก', href: '/inventory/stock' }
          ]
        },
        {
          name: 'การเงิน',
          icon: Wallet,
          children: [
            { name: 'จัดการเงินสด', href: '/admin/finance/cashbook' },
            { name: 'ยอดประจำวัน', href: '/admin/finance/close-day' },
            { name: 'รายงานการขาย', href: '/admin/finance/reports' }
          ]
        },
        {
          name: 'รับประกัน',
          icon: ShieldCheck,
          children: [
            { name: 'จัดการรับประกัน', href: '/warranty' },
            { name: 'การเคลม', href: '/claims' }
          ]
        },
        { name: 'ผู้ใช้', href: '/admin/users', icon: Users },
        {
          name: 'ระบบ',
          icon: Settings,
          children: [
            { name: 'ตั้งค่าร้าน', href: '/settings' }
          ]
        }
      ];
    }
    // staff default
    return [
      { name: 'แดชบอร์ด', href: '/staff/dashboard', icon: LayoutDashboard },
      {
        name: 'แจ้งซ่อม',
        icon: Wrench,
        children: [
          { name: 'แจ้งซ่อมใหม่', href: '/staff/jobs/new' },
          { name: 'รายการซ่อม', href: '/staff/jobs' }
        ]
      },
      {
        name: 'ร้านค้า',
        icon: Package,
        children: [
          { name: 'ขาย (POS)', href: '/staff/sales/pos' }
        ]
      },
      {
        name: 'รับประกัน',
        icon: ShieldCheck,
        children: [
          { name: 'จัดการรับประกัน', href: '/warranty' },
          { name: 'การเคลม', href: '/claims' }
        ]
      },
      {
        name: 'ระบบ',
        icon: Settings,
        children: [
          { name: 'ตั้งค่าร้าน', href: '/settings' }
        ]
      }
    ];
  }, [currentRole]);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  // Sync collapsed with parent-controlled open state on all screen sizes
  useEffect(() => {
    if (typeof mobileOpen !== 'boolean') return;
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
          "fixed top-0 left-0 z-50 h-screen text-white shadow-xl transition-all duration-500 ease-in-out overflow-hidden transform flex flex-col",
          // Gradient background changed to blue-only tone
          "bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700",
          // Off-canvas when collapsed, visible when open (all screen sizes)
          collapsed ? "-translate-x-full w-64 pointer-events-none" : "translate-x-0 w-64",
          // Desktop: do not reserve layout space when closed
          collapsed ? "lg:fixed lg:-translate-x-full" : "lg:static lg:translate-x-0 lg:z-auto",
          className
        )}
        ref={sidebarRef}
        onMouseEnter={() => !collapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-transparent">
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
          <div className="flex items-center gap-2"></div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isParentActive = hasChildren
              ? item.children!.some((c) => location.pathname === c.href)
              : location.pathname === item.href;
            const isOpen = openDropdown === item.name;

            if (hasChildren) {
              return (
                <div key={item.name} className="group relative">
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 thai-text font-medium text-[14px] text-white",
                      "hover:bg-white/5 hover:text-white hover:shadow-sm",
                      (isParentActive || isOpen) && "bg-white/10 text-white shadow-md",
                      collapsed && "justify-center px-2"
                    )}
                    onClick={() => setOpenDropdown((prev) => (prev === item.name ? null : item.name))}
                  >
                    {/* Active indicator bar */}
                    <span
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-r bg-white/70 origin-top transition-transform duration-300",
                        (isParentActive || isOpen) ? "scale-y-100" : "scale-y-0"
                      )}
                    />
                    <Icon className="flex-shrink-0 transition-all duration-300 w-5 h-5" />
                    {isExpanded && (
                      <span className="truncate font-medium text-[14px] flex-1 text-left">{item.name}</span>
                    )}
                    {isExpanded && (
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
                    )}
                  </button>

                  {/* Children */}
                  <div
                    className={cn(
                      "overflow-hidden transition-[grid-template-rows] duration-300",
                      isOpen ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]"
                    )}
                  >
                    <div className="min-h-0">
                      {item.children!.map((child) => {
                        const isChildActive = location.pathname === child.href;
                        return (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={cn(
                              "relative block ml-10 mr-2 mt-1 px-3 py-2 rounded-md thai-text text-[14px] text-white",
                              "hover:bg-white/5 hover:text-white",
                              isChildActive && "bg-white/10 text-white shadow-sm"
                            )}
                            onClick={() => {
                              if (window.matchMedia('(max-width: 1023px)').matches) {
                                setCollapsed(true);
                                setMobileOpen && setMobileOpen(false);
                              }
                            }}
                          >
                            {/* Active indicator for child */}
                            <span
                              className={cn(
                                "absolute left-0 top-0 h-full w-1 rounded-r bg-white/60 origin-top transition-transform duration-300",
                                isChildActive ? "scale-y-100" : "scale-y-0"
                              )}
                            />
                            {child.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href!}
                end
                className={({ isActive }) => cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 thai-text font-medium text-[14px] text-white",
                  "hover:bg-white/5 hover:text-white hover:shadow-sm",
                  isActive && "bg-white/10 text-white shadow-md",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => {
                  if (window.matchMedia('(max-width: 1023px)').matches) {
                    setCollapsed(true);
                    setMobileOpen && setMobileOpen(false);
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator for single link */}
                    <span
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-r bg-white/70 origin-top transition-transform duration-300",
                        isActive ? "scale-y-100" : "scale-y-0"
                      )}
                    />
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
        <div className="mt-auto p-4 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-white/10">
          <Button
            variant="outline"
            className="w-full justify-center rounded-lg bg-white/10 border-white/20 text-white hover:bg-white/15 thai-text"
                    onClick={() => {
          // Use store logout function
          useRepairStore.getState().logout();
          
          // Redirect to login page
          window.location.href = '/shared/auth/login';
        }}
          >
            <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
          </Button>
        </div>
      </div>

      
    </>
  );
}