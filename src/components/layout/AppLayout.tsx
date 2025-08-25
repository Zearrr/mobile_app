// Main Application Layout
import { Button } from '@/components/ui/button';
import { useRepairStore } from '@/stores/useRepairStore';
import { Loader2, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const currentUser = useRepairStore(state => state.currentUser);
  const loadAllData = useRepairStore(state => state.loadAllData);
  const isLoading = useRepairStore(state => state.isLoading);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get current page info
  const getCurrentPageInfo = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return { title: 'หน้าแรก', description: 'หน้าแรกของระบบ' };
      case '/dashboard':
        return { title: 'แดชบอร์ด', description: 'ภาพรวมของระบบ' };
      case '/jobs':
        return { title: 'จัดการงานซ่อม', description: 'จัดการงานซ่อมทั้งหมด' };
      case '/parts':
        return { title: 'จัดการสินค้า', description: 'จัดการสต็อกสินค้า' };
      case '/pricing':
        return { title: 'คำนวณราคา', description: 'คำนวณราคาและสร้างใบเสนอราคา' };
      case '/cashbook':
        return { title: 'รายรับ-รายจ่าย', description: 'จัดการบัญชีรายรับ-รายจ่าย' };
      case '/pos/sale':
        return { title: 'ขาย (POS)', description: 'ระบบขายแบบ Point of Sale' };
      case '/po':
        return { title: 'ใบสั่งซื้อ (PO)', description: 'จัดการใบสั่งซื้อ' };
      case '/reports':
        return { title: 'รายงาน', description: 'ดูรายงานต่างๆ' };
      case '/users':
        return { title: 'ผู้ใช้', description: 'จัดการผู้ใช้ระบบ' };
      case '/settings':
        return { title: 'ตั้งค่า', description: 'ตั้งค่าระบบ' };
      default:
        return { title: 'แจ้งซ่อมใหม่', description: 'ไม่พบหน้าที่ต้องการ' };
    }
  };

  const currentPageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        <Sidebar className={`lg:fixed`} mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto h-screen bg-secondary transition-all duration-300 lg:ml-64`}>
          {/* Top Header Bar - ใช้ร่วมกันในทุกหน้า */}
          <div className="bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-lg w-full sticky top-0 z-40">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(prev => !prev)}
                  className="hover:bg-primary/10 hover:text-primary rounded-xl p-3 transition-all duration-300"
                >
                  <Menu className="w-6 h-6" />
                </Button>
                <div className="text-base font-medium text-muted-foreground thai-text">{currentPageInfo.title}</div>
              </div>
              
              {/* Store Name */}
              <div className="font-bold text-xl text-primary thai-text bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                ร้านซ่อมมือถือ
              </div>
            </div>
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground thai-text">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          )}
          
          {/* Main content */}
          <div className="w-full">
            <Outlet context={{ sidebarOpen, setSidebarOpen, currentPageInfo }} />
          </div>
        </main>
      </div>
    </div>
  );
}