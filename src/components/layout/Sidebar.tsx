// Modern Sidebar Navigation
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Package, 
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';

const navigation = [
  {
    name: 'แดชบอร์ด',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'รายการงาน',
    href: '/jobs',
    icon: Wrench
  },
  {
    name: 'แจ้งซ่อมใหม่',
    href: '/jobs/new',
    icon: Smartphone
  },
  {
    name: 'ลูกค้า',
    href: '/customers',
    icon: Users
  },
  {
    name: 'อะไหล่',
    href: '/parts',
    icon: Package
  },
  {
    name: 'ตั้งราคา',
    href: '/pricing',
    icon: Calculator
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
  const location = useLocation();
  const logout = useRepairStore(state => state.logout);
  const settings = useRepairStore(state => state.settings);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

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
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r border-border shadow-card transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64",
        "lg:static lg:z-auto",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn(
            "flex items-center gap-3 transition-opacity duration-200",
            collapsed ? "opacity-0 lg:opacity-100" : "opacity-100"
          )}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="font-bold text-lg gradient-text">
                {settings?.storeName || 'Repair Pro'}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="lg:hidden"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 thai-text font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground shadow-md"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-3 right-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 thai-text",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && 'ออกจากระบบ'}
          </Button>
        </div>

        {/* Toggle button for desktop */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background shadow-md"
        >
          {collapsed ? (
            <Menu className="w-3 h-3" />
          ) : (
            <X className="w-3 h-3" />
          )}
        </Button>
      </div>
    </>
  );
}