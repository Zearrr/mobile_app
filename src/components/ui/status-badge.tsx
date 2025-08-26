// Status Badge Component with Thai labels
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JobStatus, PaymentStatus } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  Beaker,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  Package,
  Search,
  Truck,
  Wrench,
  XCircle
} from "lucide-react";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusConfig = {
  received: {
    label: 'รับงาน',
    icon: Clock,
    className: 'bg-gradient-to-b from-sky-600 to-sky-500 text-white border border-sky-700/30 hover:from-sky-700 hover:to-sky-600 shadow-md'
  },
  checking: {
    label: 'กำลังตรวจเช็ค',
    icon: Search,
    className: 'bg-gradient-to-b from-cyan-600 to-cyan-500 text-white border border-cyan-700/30 hover:from-cyan-700 hover:to-cyan-600 shadow-md'
  },
  in_progress: {
    label: 'กำลังซ่อม',
    icon: Wrench,
    className: 'bg-gradient-to-b from-amber-600 to-amber-500 text-white border border-amber-700/30 hover:from-amber-700 hover:to-amber-600 shadow-md'
  },
  waiting_parts: {
    label: 'รอสินค้า',
    icon: Package,
    className: 'bg-gradient-to-b from-violet-600 to-violet-500 text-white border border-violet-700/30 hover:from-violet-700 hover:to-violet-600 shadow-md'
  },
  testing: {
    label: 'ทดสอบ',
    icon: Beaker,
    className: 'bg-gradient-to-b from-indigo-600 to-indigo-500 text-white border border-indigo-700/30 hover:from-indigo-700 hover:to-indigo-600 shadow-md'
  },
  done: {
    label: 'ซ่อมเสร็จ',
    icon: CheckCircle,
    className: 'bg-gradient-to-b from-green-600 to-green-500 text-white border border-green-700/30 hover:from-green-700 hover:to-green-600 shadow-md'
  },
  delivered: {
    label: 'ส่งมอบแล้ว',
    icon: Truck,
    className: 'bg-gradient-to-b from-emerald-600 to-emerald-500 text-white border border-emerald-700/30 hover:from-emerald-700 hover:to-emerald-600 shadow-md'
  },
  returned: {
    label: 'รับคืนแล้ว',
    icon: ArrowLeft,
    className: 'bg-gradient-to-b from-slate-600 to-slate-500 text-white border border-slate-700/30 hover:from-slate-700 hover:to-slate-600 shadow-md'
  },
  cancelled: {
    label: 'ยกเลิก',
    icon: XCircle,
    className: 'bg-gradient-to-b from-rose-600 to-rose-500 text-white border border-rose-700/30 hover:from-rose-700 hover:to-rose-600 shadow-md'
  }
};

const paymentConfig = {
  unpaid: {
    label: 'ยังไม่ชำระ',
    icon: AlertCircle,
    className: 'bg-gradient-to-b from-rose-600 to-rose-500 text-white border border-rose-700/30 hover:from-rose-700 hover:to-rose-600 shadow-md'
  },
  deposit: {
    label: 'มัดจำแล้ว',
    icon: Coins,
    className: 'bg-gradient-to-b from-blue-600 to-blue-500 text-white border border-blue-700/30 hover:from-blue-700 hover:to-blue-600 shadow-md'
  },
  paid: {
    label: 'ชำระแล้ว',
    icon: CreditCard,
    className: 'bg-gradient-to-b from-green-600 to-green-500 text-white border border-green-700/30 hover:from-green-700 hover:to-green-600 shadow-md'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'thai-text font-medium gap-1.5 px-3 py-1 rounded-full text-[12px] ring-1 ring-inset ring-white/20 shadow-sm transition-colors',
        config.className,
        className
      )}
    >
      <Icon className="w- h-3.5" />
      {config.label}
    </Badge>
  );
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const config = paymentConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'thai-text font-medium gap-1.5 px-3 py-1 rounded-full text-[12px] ring-1 ring-inset ring-white/20 shadow-sm transition-colors',
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// Status dot component for compact display
export function StatusDot({ status, className }: { status: JobStatus, className?: string }) {
  const config = statusConfig[status];
  
  const dotColors = {
    received: 'bg-blue-500',
    checking: 'bg-cyan-500',
    in_progress: 'bg-orange-500',
    waiting_parts: 'bg-purple-500',
    testing: 'bg-amber-500',
    done: 'bg-green-500',
    delivered: 'bg-emerald-500',
    returned: 'bg-gray-500',
    cancelled: 'bg-red-500'
  };
  
  return (
    <div 
      className={cn(
        'w-2.5 h-2.5 rounded-full',
        dotColors[status],
        className
      )}
      title={config.label}
    />
  );
}

export function PaymentDot({ status, className }: { status: PaymentStatus, className?: string }) {
  const config = paymentConfig[status];
  
  const dotColors = {
    unpaid: 'bg-red-500',
    deposit: 'bg-yellow-500',
    paid: 'bg-green-500'
  };
  
  return (
    <div 
      className={cn(
        'w-2.5 h-2.5 rounded-full',
        dotColors[status],
        className
      )}
      title={config.label}
    />
  );
}