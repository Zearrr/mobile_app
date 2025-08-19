// Main Application Layout
import { useRepairStore } from '@/stores/useRepairStore';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const currentUser = useRepairStore(state => state.currentUser);
  const loadAllData = useRepairStore(state => state.loadAllData);
  const isLoading = useRepairStore(state => state.isLoading);
  const location = useLocation();

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
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto h-screen bg-gray-50">
          {/* Loading overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-gray-600 thai-text">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          )}
          
          {/* Main content */}
          <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}