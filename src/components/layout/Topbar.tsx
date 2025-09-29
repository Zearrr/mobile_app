import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  User as UserIcon,
  Users,
  Wallet,
  Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Page Header Component ที่ไฟล์อื่นสามารถเรียกใช้ได้
interface PageHeaderProps {
  title: string;
  description: string;
  showActions?: boolean;
  icon?: any;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, showActions = false, icon, actions }: PageHeaderProps) => {
  const location = useLocation();
  const isPartsPage = location.pathname.startsWith('/parts');
  const IconEl = icon || Wrench;
  return (
    <div className="rounded-2xl bg-blue-600 text-white shadow-xl py-4 md:py-5 px-6 md:px-8 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
          <IconEl className="w-5 h-5" />
        </div>
        <div>
          <div className="text-base md:text-lg font-bold">{title}</div>
          <div className="text-white/90 thai-text text-xs md:text-sm">{description}</div>
        </div>
      </div>
      {actions ? (
        <div className="hidden sm:flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};

type NavChild = { name: string; href: string };
type NavItem = { name: string; href?: string; icon: any; children?: NavChild[] };

const navigation: NavItem[] = [
  { name: 'หน้าแรก', href: '/', icon: LayoutDashboard },
  {
    name: 'แจ้งซ่อม',
    icon: Wrench,
    children: [
      { name: 'แจ้งซ่อมใหม่', href: '/jobs/new' },
      { name: 'รายการซ่อม', href: '/jobs' },
      { name: 'คำนวณราคา', href: '/pricing' }
    ]
  },
  // ลบปุ่มเมนูหลัก "ขาย (POS)" ออก (ย้ายไปอยู่ใต้ร้านค้าแทน)
  { name: 'ร้านค้า', href: '/parts', icon: Package, children: [
    { name: 'ขาย (POS)', href: '/pos/sale' },
    { name: 'ประวัติการขาย', href: '/sales/history' },
    { name: 'จัดการสินค้า', href: '/parts' },
    { name: 'ประวัติสต๊อก', href: '/inventory/stock' }
  ] },
  { name: 'การเงิน', href: '/cashbook', icon: Wallet, children: [
    { name: 'จัดการเงินสด', href: '/cashbook' },
    { name: 'ยอดประจำวัน', href: '/close-day' },
    { name: 'รายงานการขาย', href: '/reports' }
  ] },
  { name: 'รับประกัน', href: '/warranty', icon: ShieldCheck, children: [
    { name: 'จัดการรับประกัน', href: '/warranty' },
    { name: 'การเคลม', href: '/claims' }
  ] },
  { name: 'ผู้ใช้', href: '/users', icon: Users },
  { name: 'ระบบ', href: '/settings', icon: Settings, children: [
    { name: 'ตั้งค่าร้าน', href: '/settings' }
  ] }
];

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps = {}) {
  const location = useLocation();
  const settings = useRepairStore(state => state.settings);
  const currentUser = useRepairStore(state => state.currentUser);
  const currentRole = useRepairStore(state => state.currentRole);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown when route changes
  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  const toggleDropdown = (menuName: string) => {
    setOpenDropdown(prev => prev === menuName ? null : menuName);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <div className="w-full bg-blue-700 text-white border-b border-blue-700">
      <div className="flex items-center justify-between gap-4 px-4 lg:px-8 py-2">

        {/* Menu button (all screens) */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-white/10 text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Brand + user info chip */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
              <img src="/LOGOKODPHONE.png" alt="logo" className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold thai-text text-white whitespace-nowrap">ระบบซ่อมมือถือ</div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1.5">
            <UserIcon className="w-4 h-4" />
            <span className="thai-text text-sm whitespace-nowrap">{currentUser || 'Guest'}</span>
            {currentRole && (
              <span className="thai-text text-xs rounded-full bg-emerald-500 text-white px-2 py-0.5 whitespace-nowrap">
                {currentRole === 'owner' ? 'ผู้ดูแลระบบ' : currentRole === 'cashier' ? 'แคชเชียร์' : currentRole === 'tech' ? 'ช่าง' : 'พนักงาน'}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-visible">
          <nav className="flex items-center gap-2 min-w-max">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href && (location.pathname === item.href);
              const hasChildren = item.children && item.children.length > 0;
              const isDropdownOpen = openDropdown === item.name;
              
              const baseClass = cn(
                'relative inline-flex items-center gap-2 px-3 py-2 rounded-md thai-text text-[14px] transition-colors duration-200',
                'hover:bg-white/10 hover:text-white',
                isActive ? 'bg-white/20 text-white' : 'text-white/80'
              );

              if (hasChildren) {
                return (
                  <div key={item.name} className="relative">
                    <button 
                      type="button" 
                      className={cn(baseClass, 'cursor-pointer')}
                      onClick={() => toggleDropdown(item.name)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="whitespace-nowrap">{item.name}</span>
                    </button>
                    
                    {/* Dropdown Menu - Only shows when clicked */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 z-50">
                        <div className="w-64 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 p-2 min-w-max">
                          {item.children!.map((child) => {
                            const isChildActive = location.pathname === child.href;
                            return (
                              <NavLink
                                key={child.name}
                                to={child.href}
                                className={cn(
                                  'block px-3 py-2.5 rounded-md thai-text text-[14px] transition-colors duration-150',
                                  'hover:bg-blue-50 hover:text-blue-700',
                                  isChildActive 
                                    ? 'bg-blue-100 text-blue-700 font-semibold' 
                                    : 'text-gray-700'
                                )}
                                onClick={closeDropdown}
                              >
                                {child.name}
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink key={item.name} to={item.href || '#'} className={baseClass}>
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default Topbar;


