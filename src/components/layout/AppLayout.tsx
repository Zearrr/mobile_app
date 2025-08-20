// Main Application Layout
import { useRepairStore } from '@/stores/useRepairStore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const currentUser = useRepairStore(state => state.currentUser);
  const loadAllData = useRepairStore(state => state.loadAllData);
  const isLoading = useRepairStore(state => state.isLoading);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {sidebarOpen && <Sidebar />}
        
        <main className={`flex-1 overflow-y-auto h-screen bg-secondary transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
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
            <Outlet context={{ sidebarOpen, setSidebarOpen }} />
          </div>
        </main>
      </div>
    </div>
  );
}