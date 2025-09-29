// Mobile Repair Pro - Type Definitions
export type JobStatus = 'received' | 'checking' | 'waiting_parts' | 'in_progress' | 'testing' | 'done' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'deposit' | 'paid';
export type LockType = 'none' | 'pin' | 'pattern';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'promptpay';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  lineId?: string;
  email?: string;
  address?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string; // ใช้เป็นรหัสเช่น R00001
  code?: string; // สำรองไว้เผื่อแยก code ออกจาก id ในอนาคต
  customerId: string;
  
  // ข้อมูลอุปกรณ์
  brand: string;
  model: string;
  color?: string;
  imei?: string;
  serial?: string;
  
  // ข้อมูลล็อกหน้าจอ
  lockType: LockType;
  lockNote?: string;
  photos?: string[]; // URLs หรือ base64
  
  // รายละเอียดงาน
  issueDesc: string;
  accessories: string;
  preCheck: string;
  
  // ข้อมูลการเงิน
  costParts: number;
  costLabor: number;
  feeParts?: number; // ค่าขายสินค้า
  feeLabor?: number; // ค่าแรงคิดลูกค้า
  deposit: number;
  total: number;
  profit: number;
  
  // สถานะและเวลา
  status: JobStatus;
  paymentStatus: PaymentStatus;
  technician?: string;
  receivedAt: Date;
  dueAt?: Date;
  completedAt?: Date;
  
  // รับประกันและข้อตกลง
  warrantyDays: number;
  warrantyType?: string;
  pdpaConsentAt?: Date;
  customerSign?: string; // base64 signature
  staffSign?: string; // base64 signature
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  forBrand?: string;
  forModel?: string;
  unit: string;
  cost: number;
  price: number;
  stock: number;
  minStock?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  paidAt: Date;
  createdAt: Date;
}

export interface Settings {
  id: string;
  storeName: string;
  address: string;
  phone: string;
  line?: string;
  logoUrl?: string;
  
  // การตั้งค่าเริ่มต้น
  profitPercentDefault: number;
  warrantyDefaultDays: number;
  
  // ข้อความและเงื่อนไข
  pdpaText: string;
  termsText: string;
  
  // การชำระเงิน
  promptPayId?: string;
  bankAccount?: string;
  vatEnabled?: boolean;
  
  // การพิมพ์
  printFontSize: number;
  printMargin: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// เพิ่มโมเดลที่ต้องใช้เพิ่มเติมในระบบร้านมือถือ
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  lineId?: string;
  address?: string;
  createdAt: Date;
}

export type StockMoveType = 'receive' | 'sale' | 'use_for_job' | 'adjust';
export interface StockMove {
  id: string;
  partId: string;
  type: StockMoveType;
  qty: number;
  unitCost: number;
  ref?: string; // ref โค้ดเอกสาร เช่น R00001 หรือ SO00001
  createdAt: Date;
}

export interface QuoteItem { name: string; qty: number; unitPrice: number; cost?: number }
export interface Quote {
  id: string;
  jobId?: string;
  customerId: string;
  brand?: string;
  model?: string;
  items: QuoteItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  approvedAt?: Date;
  createdAt: Date;
}

export interface SaleItem { sku: string; name: string; qty: number; unitPrice: number; cost?: number }
export interface SalePayment { method: PaymentMethod; amount: number }
export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  customerId?: string;
  customer?: string; // ชื่อลูกค้า
  customerPhone?: string; // เบอร์โทรลูกค้า
  method: PaymentMethod; // ยังคงไว้เพื่อ backward-compat (กรณีชำระช่องทางเดียว)
  payments?: SalePayment[]; // รองรับหลายช่องทาง
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  employee?: string; // พนักงานขาย
}

export interface Expense {
  id: string;
  date: Date;
  category: string;
  note?: string;
  amount: number;
  method: PaymentMethod;
  createdBy: string;
}

export interface CloseDay {
  id: string;
  date: Date;
  openingCash: number;
  cashIn: number;
  cashOut: number;
  transferIn: number;
  promptpayIn: number;
  cardIn: number;
  expectedCash: number;
  actualCash: number;
  diff: number;
  signer: string;
}

export interface User {
  id: string;
  name: string;
  username?: string; // demo login username
  password?: string; // demo login password (plain, demo only)
  role: 'owner' | 'cashier' | 'tech' | 'staff';
  active: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'create' | 'update' | 'delete' | 'print' | 'close-day';
  entity: string; // e.g., 'job','sale','expense','closeDay','quote'
  entityId: string;
  userId: string;
  at: Date;
  detail?: string;
}

// Purchasing
export interface POItem { partId: string; sku: string; name: string; qty: number; unitCost: number }
export interface PurchaseOrder {
  id: string; // PO code
  supplierId: string;
  date: Date;
  items: POItem[];
  note?: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface GRItem { partId: string; sku: string; name: string; qty: number; unitCost: number }
export interface GoodsReceipt {
  id: string; // GR code
  date: Date;
  supplierId?: string;
  poId?: string;
  items: GRItem[];
  note?: string;
  total: number;
}

// Dashboard Summary
export interface DashboardSummary {
  totalJobs: number;
  completedJobs: number;
  paidJobs: number;
  totalRevenue: number;
  totalProfit: number;
  pendingJobs: number;
  overdueJobs: number;
}

// Filters และ Search
export interface JobFilters {
  status?: JobStatus[];
  paymentStatus?: PaymentStatus[];
  technician?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Form Data Types
export interface NewJobFormData {
  customer: {
    name: string;
    phone: string;
    lineId?: string;
  };
  device: {
    brand: string;
    model: string;
    color?: string;
    imei?: string;
    serial?: string;
  };
  lock: {
    type: LockType;
    note?: string;
  };
  details: {
    issueDesc: string;
    accessories: string;
    preCheck: string;
  };
  pricing: {
    estimateParts: number;
    estimateLabor: number;
    deposit: number;
  };
  schedule: {
    dueAt?: Date;
    warrantyDays: number;
    technician?: string;
  };
}

// Utility Types
export type CreateJobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'customerId'> & {
  customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
};

export type UpdateJobInput = Partial<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>>;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}