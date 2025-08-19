import { useRepairStore } from '@/stores/useRepairStore';
import { ReactNode } from 'react';

type Role = 'owner' | 'cashier' | 'tech' | 'staff';

export function Can({ roles, children, fallback = null }: { roles: Role[]; children: ReactNode; fallback?: ReactNode }) {
  const currentRole = useRepairStore(s => s.currentRole);
  if (!currentRole) return fallback;
  if (currentRole === 'owner') return children as any;
  return roles.includes(currentRole) ? (children as any) : fallback;
}


