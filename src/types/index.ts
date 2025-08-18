// Mobile Repair Pro - Type Definitions
export type JobStatus = 'received' | 'in_progress' | 'waiting_parts' | 'done' | 'returned' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'deposit' | 'paid';
export type LockType = 'none' | 'pin' | 'pattern';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'promptpay';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lineId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string; // รูปแบบ R00001
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
  photos: string[]; // URLs หรือ base64
  
  // รายละเอียดงาน
  issueDesc: string;
  accessories: string;
  preCheck: string;
  
  // ข้อมูลการเงิน
  estimateParts: number;
  estimateLabor: number;
  costParts: number;
  costLabor: number;
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
  pdpaConsentAt?: Date;
  customerSign?: string; // base64 signature
  staffSign?: string; // base64 signature
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Part {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  cost: number;
  price: number;
  stock: number;
  category?: string;
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
  
  // การพิมพ์
  printFontSize: number;
  printMargin: number;
  
  createdAt: Date;
  updatedAt: Date;
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
    accessories?: string;
    preCheck?: string;
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