import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0
  }).format(amount);
}

// Money helpers
export const sum = (values: number[]) => values.reduce((a, b) => a + (Number(b) || 0), 0);
export const calcSubtotal = (items: { qty: number; unitPrice: number }[]) =>
  items.reduce((s, it) => s + (Number(it.qty) * Number(it.unitPrice)), 0);
export const calcProfit = (params: { feeParts?: number; feeLabor?: number; costParts?: number; costLabor?: number }) => {
  const revenue = (params.feeParts || 0) + (params.feeLabor || 0);
  const cost = (params.costParts || 0) + (params.costLabor || 0);
  return revenue - cost;
};