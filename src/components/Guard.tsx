import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export const RoleGuard = ({ children, allowedRoles, fallbackPath = '/login' }: RoleGuardProps) => {
  const navigate = useNavigate();
  
  // ตรวจสอบ role จาก localStorage หรือ context
  const userRole = (localStorage.getItem('repairpro_role') as string) || 'staff';
  
  useEffect(() => {
    if (!allowedRoles.includes(userRole)) {
      navigate(fallbackPath);
    }
  }, [userRole, allowedRoles, fallbackPath, navigate]);
  
  if (!allowedRoles.includes(userRole)) {
    return null;
  }
  
  return <>{children}</>;
};

// Component สำหรับตรวจสอบว่าเป็น admin หรือไม่
export const AdminGuard = ({ children }: { children: ReactNode }) => {
  return (
    <RoleGuard allowedRoles={['admin', 'owner']} fallbackPath="/dashboard">
      {children}
    </RoleGuard>
  );
};

// Component สำหรับตรวจสอบว่าเป็น staff หรือไม่
export const StaffGuard = ({ children }: { children: ReactNode }) => {
  return (
    <RoleGuard allowedRoles={['staff', 'admin', 'owner']} fallbackPath="/login">
      {children}
    </RoleGuard>
  );
};

// Hook สำหรับตรวจสอบ role
export const useRole = () => {
  const userRole = (localStorage.getItem('repairpro_role') as string) || 'staff';
  
  const isAdmin = ['admin', 'owner'].includes(userRole);
  const isStaff = ['staff', 'admin', 'owner'].includes(userRole);
  
  return {
    role: userRole,
    isAdmin,
    isStaff
  };
};

// ตัวช่วยให้ใช้รูปแบบเดิมได้ (Can roles=[...])
export const Can = ({ roles, children }: { roles: string[]; children: ReactNode }) => {
  return (
    <RoleGuard allowedRoles={roles} fallbackPath="/login">
      {children}
    </RoleGuard>
  );
};