// Modern Sidebar Navigation
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import {
    BarChart3,
    Calculator,
    LayoutDashboard,
    Menu,
    Package,
    Settings,
    ShieldCheck,
    Users,
    Wallet
} from 'lucide-react';
import { useState } from 'react';
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
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const settings = useRepairStore(state => state.settings);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isExpanded = !collapsed || isHovered;

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          collapsed ? "block" : "hidden"
        )}
        onClick={() => setCollapsed(false)}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-primary text-primary-foreground border-r border-primary-dark shadow-lg transition-all duration-500 ease-in-out overflow-hidden",
          collapsed ? "w-24" : "w-72",
          "lg:static lg:z-auto",
          className
        )}
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
              <div className="font-bold text-lg text-white">
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 thai-text font-medium text-sm text-white/80",
                  "hover:bg.white/10 hover:text-white hover:shadow-sm",
                  isActive && "bg-white/20 text-white shadow-md",
                  collapsed && "justify-center px-2"
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "flex-shrink-0 transition-all duration-300 w-5 h-5",
                      isActive && "text-white"
                    )} />
                    {isExpanded && (
                      <span className="truncate font-medium text-sm">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
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