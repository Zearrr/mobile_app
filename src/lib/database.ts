// Mobile Repair Pro - Database Layer with Dexie (IndexedDB)
import Dexie, { Table } from 'dexie';
import { Customer, Job, Part, Payment, Settings } from '@/types';
import { format } from 'date-fns';

export class RepairDatabase extends Dexie {
  customers!: Table<Customer>;
  jobs!: Table<Job>;
  parts!: Table<Part>;
  payments!: Table<Payment>;
  settings!: Table<Settings>;

  constructor() {
    super('RepairProDatabase');
    
    this.version(1).stores({
      customers: 'id, name, phone, lineId, createdAt',
      jobs: 'id, customerId, status, paymentStatus, receivedAt, dueAt, technician, brand, model',
      parts: 'id, name, brand, model, category, stock',
      payments: 'id, jobId, paidAt, method',
      settings: 'id'
    });
  }
}

export const db = new RepairDatabase();

// Utility Functions
export const generateJobId = async (): Promise<string> => {
  const today = new Date();
  const prefix = format(today, 'yyMM');
  
  const lastJob = await db.jobs
    .where('id')
    .startsWith(`R${prefix}`)
    .reverse()
    .first();
    
  if (!lastJob) {
    return `R${prefix}001`;
  }
  
  const lastNumber = parseInt(lastJob.id.slice(-3));
  const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `R${prefix}${nextNumber}`;
};

export const generateCustomerId = (): string => {
  return `C${Date.now().toString(36).toUpperCase()}`;
};

export const generatePartId = (): string => {
  return `P${Date.now().toString(36).toUpperCase()}`;
};

export const generatePaymentId = (): string => {
  return `PAY${Date.now().toString(36).toUpperCase()}`;
};

// Seed Data
export const seedDatabase = async () => {
  const existingSettings = await db.settings.toArray();
  if (existingSettings.length === 0) {
    // Create default settings
    const defaultSettings: Settings = {
      id: 'default',
      storeName: 'Mobile Repair Pro',
      address: '123 ถนนเทคโนโลยี แขวงดิจิทัล เขตอินโนเวชั่น กรุงเทพฯ 10240',
      phone: '02-123-4567',
      line: '@mobilerepairpro',
      profitPercentDefault: 35,
      warrantyDefaultDays: 30,
      pdpaText: `การรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
      
ร้านซ่อมมือถือของเรามีความจำเป็นต้องเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน เช่น ชื่อ-นามสกุล หมายเลขโทรศัพท์ เพื่อวัตถุประสงค์ในการติดต่อและแจ้งผลการซ่อม
      
ข้อมูลของท่านจะถูกเก็บรักษาไว้เป็นความลับและจะไม่เปิดเผยต่อบุคคลที่สาม ยกเว้นกรณีที่มีกฎหมายกำหนด`,
      termsText: `เงื่อนไขการให้บริการ
      
1. การรับประกัน: สินค้าที่ซ่อมแล้วมีการรับประกัน 30 วัน (หรือตามที่ระบุ)
2. การชำระเงิน: กรุณาชำระค่าบริการเมื่อมารับสินค้า
3. การเก็บสินค้า: หากไม่มารับสินค้าภายใน 30 วัน ทางร้านขอสงวนสิทธิ์ในการจำหน่ายสินค้า
4. ความรับผิดชอบ: ทางร้านไม่รับผิดชอบต่อข้อมูลที่สูญหายในอุปกรณ์`,
      printFontSize: 12,
      printMargin: 16,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.settings.add(defaultSettings);
  }
  
  // Check if we need to add sample data
  const existingCustomers = await db.customers.toArray();
  if (existingCustomers.length === 0) {
    // Add sample customers
    const customers: Customer[] = [
      {
        id: generateCustomerId(),
        name: 'คุณสมชาย ใจดี',
        phone: '081-234-5678',
        lineId: 'somchai123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: generateCustomerId(),
        name: 'คุณสมหญิง สวยงาม',
        phone: '089-876-5432',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: generateCustomerId(),
        name: 'คุณอนุชา เก่งมาก',
        phone: '092-111-2222',
        lineId: 'anucha_smart',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ];
    
    await db.customers.bulkAdd(customers);
    
    // Add sample parts
    const parts: Part[] = [
      {
        id: generatePartId(),
        name: 'หน้าจอ iPhone 14',
        brand: 'Apple',
        model: 'iPhone 14',
        category: 'จอแสดงผล',
        cost: 3500,
        price: 4900,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: generatePartId(),
        name: 'แบตเตอรี่ Samsung S23',
        brand: 'Samsung',
        model: 'Galaxy S23',
        category: 'แบตเตอรี่',
        cost: 800,
        price: 1200,
        stock: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.parts.bulkAdd(parts);
    
    // Add sample jobs
    const now = new Date();
    const jobs: Job[] = [
      {
        id: await generateJobId(),
        customerId: customers[0].id,
        brand: 'Apple',
        model: 'iPhone 14',
        color: 'สีน้ำเงิน',
        imei: '123456789012345',
        lockType: 'pin',
        lockNote: '1234',
        photos: [],
        issueDesc: 'หน้าจอแตกรอยแยก ทัชไม่ได้บางจุด',
        accessories: 'สายชาร์จ, ที่ชาร์จ',
        preCheck: 'เครื่องเปิดได้ปกติ ลำโพงใช้ได้ กล้องใช้ได้',
        estimateParts: 4900,
        estimateLabor: 500,
        costParts: 3500,
        costLabor: 500,
        deposit: 2000,
        total: 5400,
        profit: 1400,
        status: 'in_progress',
        paymentStatus: 'deposit',
        technician: 'ช่างบิ๊ก',
        receivedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        dueAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        warrantyDays: 30,
        pdpaConsentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: await generateJobId(),
        customerId: customers[1].id,
        brand: 'Samsung',
        model: 'Galaxy S23',
        color: 'สีดำ',
        lockType: 'pattern',
        lockNote: 'รูปตัว L',
        photos: [],
        issueDesc: 'แบตเตอรี่เสื่อมสภาพ ชาร์จไม่เข้า',
        accessories: 'เฉพาะเครื่อง',
        preCheck: 'เครื่องใช้งานได้ปกติ แต่แบตหมดเร็ว',
        estimateParts: 1200,
        estimateLabor: 300,
        costParts: 800,
        costLabor: 300,
        deposit: 0,
        total: 1500,
        profit: 400,
        status: 'done',
        paymentStatus: 'unpaid',
        technician: 'ช่างเล็ก',
        receivedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        warrantyDays: 30,
        pdpaConsentAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
    
    await db.jobs.bulkAdd(jobs);
  }
};

// Initialize database on load
seedDatabase().catch(console.error);