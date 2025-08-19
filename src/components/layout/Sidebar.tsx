// Modern Sidebar Navigation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  Wallet,
  X
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
    name: 'ผู้จำหน่าย',
    href: '/suppliers',
    icon: Users
  },
  {
    name: 'ใบสั่งซื้อ (PO)',
    href: '/po',
    icon: Package
  },
  {
    name: 'รับของเข้าสต็อก',
    href: '/gr',
    icon: Package
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
  const logout = useRepairStore(state => state.logout);
  const settings = useRepairStore(state => state.settings);
  const currentUser = useRepairStore(state => state.currentUser);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

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
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-500 ease-in-out overflow-hidden",
          collapsed ? "w-24" : "w-96",
          "lg:static lg:z-auto",
          className
        )}
        onMouseEnter={() => !collapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className={cn(
            "flex items-center gap-4 transition-all duration-300",
            collapsed ? "opacity-0 lg:opacity-100" : "opacity-100"
          )}>
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200">
              <img src="/LOGOKODPHONE.png" alt="logo" className="w-10 h-10 object-cover" />
            </div>
            {isExpanded && (
              <div className="font-bold text-lg text-gray-800">
                {settings?.storeName || 'ระบบร้านซ่อมมือถือ'}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden hover:bg-gray-100 rounded-full p-2"
              title={collapsed ? "แสดง Sidebar" : "ซ่อน Sidebar"}
            >
              {collapsed ? <Menu className="w-5 h-5 text-gray-600" /> : <X className="w-5 h-5 text-gray-600" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hidden lg:flex hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              title={collapsed ? "แสดง Sidebar" : "ซ่อน Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 thai-text font-medium text-gray-700 text-sm",
                  "hover:bg-gray-100 hover:shadow-sm hover:scale-105",
                  isActive && "bg-blue-600 text-white shadow-md scale-105",
                  collapsed && "justify-center px-2"
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "flex-shrink-0 transition-all duration-300",
                      isActive ? "w-6 h-6" : "w-5 h-5",
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

          {/* Logout item */}
          <div className="mt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className={cn(
                    "w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 thai-text font-medium text-red-600 text-sm",
                    "hover:bg-red-50 hover:shadow-sm hover:scale-105",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span className="truncate font-medium text-sm">ออกจากระบบ</span>}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white rounded-2xl shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="thai-text text-xl">ออกจากระบบ?</AlertDialogTitle>
                  <AlertDialogDescription className="thai-text text-gray-600">
                    คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ ข้อมูลที่ยังไม่ได้บันทึกอาจหายไป
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="thai-text bg-gray-100 hover:bg-gray-200 rounded-xl">
                    ยกเลิก
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="btn-gradient thai-text rounded-xl" 
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </nav>


      </div>

      {/* Floating toggle button when sidebar is collapsed */}
      {collapsed && (
        <Button
          variant="default"
          size="sm"
          onClick={toggleSidebar}
          className="fixed top-6 left-6 z-40 w-14 h-14 rounded-full bg-blue-600 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 lg:hidden"
        >
          <Menu className="w-7 h-7 text-white" />
        </Button>
      )}




    </>
  );
}