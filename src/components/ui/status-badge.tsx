// Status Badge Component with Thai labels
import { Badge } from "@/components/ui/badge";
import { JobStatus, PaymentStatus } from "@/types";
import { 
  Clock, 
  Wrench, 
  Package, 
  CheckCircle, 
  ArrowLeft, 
  XCircle,
  CreditCard,
  Coins,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
  },
  in_progress: {
    label: 'กำลังซ่อม',
    icon: Wrench,
    className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
  },
  waiting_parts: {
    label: 'รออะไหล่',
    icon: Package,
    className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
  },
  done: {
    label: 'ซ่อมเสร็จ',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
  },
  returned: {
    label: 'ส่งมอบแล้ว',
    icon: ArrowLeft,
    className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
  },
  cancelled: {
    label: 'ยกเลิก',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  }
};

const paymentConfig = {
  unpaid: {
    label: 'ยังไม่ชำระ',
    icon: AlertCircle,
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  },
  deposit: {
    label: 'มัดจำแล้ว',
    icon: Coins,
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
  },
  paid: {
    label: 'ชำระแล้ว',
    icon: CreditCard,
    className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'thai-text font-medium gap-1.5 px-3 py-1 transition-colors',
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
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
        'thai-text font-medium gap-1.5 px-3 py-1 transition-colors',
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}

// Status dot component for compact display
export function StatusDot({ status, className }: { status: JobStatus, className?: string }) {
  const config = statusConfig[status];
  
  const dotColors = {
    received: 'bg-blue-500',
    in_progress: 'bg-orange-500',
    waiting_parts: 'bg-purple-500',
    done: 'bg-green-500',
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