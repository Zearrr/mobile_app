// Mobile Repair Pro - Database Layer with Dexie (IndexedDB)
import {
    CloseDay,
    Customer,
    Expense,
    Job,
    Part,
    Payment,
    Quote,
    Sale,
    Settings,
    StockMove,
    Supplier,
    User
} from '@/types';
import Dexie, { Table } from 'dexie';

export class RepairDatabase extends Dexie {
  customers!: Table<Customer>;
  jobs!: Table<Job>;
  parts!: Table<Part>;
  payments!: Table<Payment>;
  settings!: Table<Settings>;
  suppliers!: Table<Supplier>;
  stockMoves!: Table<StockMove>;
  quotes!: Table<Quote>;
  sales!: Table<Sale>;
  expenses!: Table<Expense>;
  closeDays!: Table<CloseDay>;
  users!: Table<User>;
  counters!: Table<{ prefix: string; lastNumber: number }>;
  purchaseOrders!: Table<import('@/types').PurchaseOrder>;
  goodsReceipts!: Table<import('@/types').GoodsReceipt>;
  activityLogs!: Table<import('@/types').ActivityLog>;

  constructor() {
    super('RepairProDatabase');
    
    // v6: add index on jobs.createdAt to support sorting/filtering by created date
    this.version(6).stores({
      customers: 'id, name, phone, altPhone, lineId, createdAt',
      jobs: 'id, customerId, status, paymentStatus, receivedAt, dueAt, technician, brand, model, createdAt',
      parts: 'id, sku, name, forBrand, forModel, stock',
      payments: 'id, jobId, paidAt, method',
      settings: 'id',
      suppliers: 'id, name, phone, createdAt',
      stockMoves: 'id, partId, type, createdAt',
      quotes: 'id, customerId, status, createdAt',
      sales: 'id, date, total',
      expenses: 'id, date, category',
      closeDays: 'id, date',
      users: 'id, role, active',
      counters: 'prefix',
      purchaseOrders: 'id, supplierId, status, date',
      goodsReceipts: 'id, supplierId, poId, date',
      activityLogs: 'id, entity, entityId, type, at'
    });
  }
}

export const db = new RepairDatabase();

// Sequential code generator using counters table
export const genCode = async (prefix: string): Promise<string> => {
  return db.transaction('rw', db.counters, async () => {
    const existing = await db.counters.get(prefix);
    const lastNumber = existing?.lastNumber ?? 0;
    const next = lastNumber + 1;
    await db.counters.put({ prefix, lastNumber: next });
    return `${prefix}${next.toString().padStart(5, '0')}`;
  });
};

// Simple id helpers where plain unique ids are sufficient
export const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

// Seed Data
export const seedDatabase = async () => {
  const existingSettings = await db.settings.toArray();
  if (existingSettings.length === 0) {
    // Create default settings
    const defaultSettings: Settings = {
      id: 'default',
      storeName: 'ระบบซ่อมมือถือ',
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
      vatEnabled: false,
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
        id: uid('C_'),
        name: 'คุณสมชาย ใจดี',
        phone: '081-234-5678',
        lineId: 'somchai123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: uid('C_'),
        name: 'คุณสมหญิง สวยงาม',
        phone: '089-876-5432',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: uid('C_'),
        name: 'คุณอนุชา เก่งมาก',
        phone: '092-111-2222',
        lineId: 'anucha_smart',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ];
    
    await db.customers.bulkAdd(customers);
    
    // Suppliers
    const suppliers: Supplier[] = [
      { id: uid('S_'), name: 'ศูนย์สินค้ามือถือไทย', phone: '02-555-1234', lineId: 'sparethai', address: 'บางกะปิ', createdAt: new Date() },
      { id: uid('S_'), name: 'Gadget Parts Co.,Ltd.', phone: '02-777-8888', createdAt: new Date() }
    ];
    await db.suppliers.bulkAdd(suppliers);
    
    // Add sample parts
    const parts: Part[] = [
      { id: uid('P_'), sku: 'IP14-SCR-BLK', name: 'หน้าจอ iPhone 14', forBrand: 'Apple', forModel: 'iPhone 14', unit: 'ชิ้น', cost: 3500, price: 4900, stock: 5, minStock: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'S23-BAT', name: 'แบตเตอรี่ Samsung S23', forBrand: 'Samsung', forModel: 'Galaxy S23', unit: 'ก้อน', cost: 800, price: 1200, stock: 8, minStock: 3, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'MI11-CAM', name: 'กล้องหลัง Mi 11', forBrand: 'Xiaomi', forModel: 'Mi 11', unit: 'ชิ้น', cost: 600, price: 950, stock: 4, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'IP12-BACK', name: 'ฝาหลัง iPhone 12', forBrand: 'Apple', forModel: 'iPhone 12', unit: 'ชิ้น', cost: 700, price: 1200, stock: 6, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'GEN-TEMPER', name: 'ฟิล์มกระจก', unit: 'แผ่น', cost: 20, price: 79, stock: 50, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'USB-CABLE', name: 'สายชาร์จ USB-C', unit: 'เส้น', cost: 30, price: 99, stock: 30, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'BAT-IPHONE-15', name: 'แบตเตอรี่ iPhone 15', forBrand: 'Apple', forModel: 'iPhone 15', unit: 'ก้อน', cost: 1200, price: 1800, stock: 10, minStock: 3, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'SCREEN-S23', name: 'จอ Samsung S23', forBrand: 'Samsung', forModel: 'Galaxy S23', unit: 'ชิ้น', cost: 35000, price: 45000, stock: 3, minStock: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'BAT-S23', name: 'แบตเตอรี่ Samsung S23', forBrand: 'Samsung', forModel: 'Galaxy S23', unit: 'ก้อน', cost: 2400, price: 3400, stock: 15, minStock: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: uid('P_'), sku: 'CASE-IPHONE', name: 'เคส iPhone 15 Pro', forBrand: 'Apple', forModel: 'iPhone 15 Pro', unit: 'ชิ้น', cost: 6000, price: 9900, stock: 8, minStock: 2, createdAt: new Date(), updatedAt: new Date() }
    ];
    
    await db.parts.bulkAdd(parts);
    
    // Add sample jobs
    const now = new Date();
    const job1Id = await genCode('R');
    const job2Id = await genCode('R');
    const job3Id = await genCode('R');
    const jobs: Job[] = [
      {
        id: job1Id,
        code: job1Id,
        customerId: customers[0].id,
        brand: 'Apple',
        model: 'iPhone 14',
        color: 'สีน้ำเงิน',
        imei: '123456789012345',
        lockType: 'pin',
        lockNote: '1234',
        issueDesc: 'หน้าจอแตกรอยแยก ทัชไม่ได้บางจุด',
        accessories: 'สายชาร์จ, ที่ชาร์จ',
        preCheck: 'เครื่องเปิดได้ปกติ ลำโพงใช้ได้ กล้องใช้ได้',
        costParts: 3500,
        costLabor: 500,
        feeParts: 4900,
        feeLabor: 500,
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
        id: job2Id,
        code: job2Id,
        customerId: customers[1].id,
        brand: 'Samsung',
        model: 'Galaxy S23',
        color: 'สีดำ',
        lockType: 'pattern',
        lockNote: 'รูปตัว L',
        issueDesc: 'แบตเตอรี่เสื่อมสภาพ ชาร์จไม่เข้า',
        accessories: 'เฉพาะเครื่อง',
        preCheck: 'เครื่องใช้งานได้ปกติ แต่แบตหมดเร็ว',
        costParts: 800,
        costLabor: 300,
        feeParts: 1200,
        feeLabor: 300,
        deposit: 0,
        total: 1500,
        profit: 400,
        status: 'testing',
        paymentStatus: 'paid',
        technician: 'ช่างเล็ก',
        receivedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        warrantyDays: 30,
        pdpaConsentAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: job3Id,
        code: job3Id,
        customerId: customers[2].id,
        brand: 'Xiaomi',
        model: 'Mi 11',
        color: 'สีขาว',
        lockType: 'none',
        issueDesc: 'กล้องหลังไม่ชัด',
        accessories: 'เคส',
        preCheck: 'ไมค์และลำโพงปกติ',
        costParts: 600,
        costLabor: 400,
        feeParts: 950,
        feeLabor: 400,
        deposit: 500,
        total: 1350,
        profit: 350,
        status: 'received',
        paymentStatus: 'deposit',
        technician: 'ช่างต้อม',
        receivedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        warrantyDays: 30,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
    await db.jobs.bulkAdd(jobs);

    // Stock moves initial receipts for parts
    const stockMoves: StockMove[] = parts.map((p) => ({ id: uid('SM_'), partId: p.id, type: 'receive', qty: p.stock, unitCost: p.cost, ref: 'SEED', createdAt: new Date() }));
    await db.stockMoves.bulkAdd(stockMoves);

    // Payments (2)
    await db.payments.bulkAdd([
      { id: uid('PAY_'), jobId: job1Id, amount: 2000, method: 'cash', note: 'มัดจำ', paidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { id: uid('PAY_'), jobId: job2Id, amount: 1500, method: 'transfer', note: 'ชำระเต็ม', paidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }
    ]);

    // Sales (3) - Sample data for sales history
    const sales: Sale[] = [
      { 
        id: 'SAL-20250821-0017', 
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), 
        items: [ 
          { sku: 'BAT-IPHONE-15', name: 'แบตเตอรี่ iPhone 15', qty: 1, unitPrice: 1800, cost: 1200 } 
        ], 
        customer: 'ลูกค้าทั่วไป',
        customerPhone: '081-234-5678',
        method: 'transfer', 
        subtotal: 1800, 
        discount: 0, 
        tax: 0, 
        total: 1800,
        employee: 'admin'
      },
      { 
        id: 'SAL-20250820-0016', 
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), 
        items: [ 
          { sku: 'SCREEN-S23', name: 'จอ Samsung S23', qty: 1, unitPrice: 45000, cost: 35000 },
          { sku: 'BAT-S23', name: 'แบตเตอรี่ Samsung S23', qty: 4, unitPrice: 3400, cost: 2400 }
        ], 
        customer: 'ลูกค้าทั่วไป',
        customerPhone: '089-876-5432',
        method: 'transfer', 
        subtotal: 58600, 
        discount: 0, 
        tax: 0, 
        total: 58500,
        employee: 'admin'
      },
      { 
        id: 'SAL-20250819-0015', 
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), 
        items: [ 
          { sku: 'CASE-IPHONE', name: 'เคส iPhone 15 Pro', qty: 1, unitPrice: 9900, cost: 6000 } 
        ], 
        customer: 'ลูกค้าทั่วไป',
        customerPhone: '082-345-6789',
        method: 'cash', 
        subtotal: 9900, 
        discount: 0, 
        tax: 0, 
        total: 9900,
        employee: 'admin'
      }
    ];
    await db.sales.bulkAdd(sales);

    // Expenses (2)
    const expenses: Expense[] = [
      { id: uid('EX_'), date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), category: 'ค่าเช่า', amount: 5000, method: 'transfer', createdBy: 'ระบบ' },
      { id: uid('EX_'), date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), category: 'ค่าน้ำ-ไฟ', note: 'รอบเดือนล่าสุด', amount: 1200, method: 'cash', createdBy: 'ระบบ' }
    ];
    await db.expenses.bulkAdd(expenses);
  }
};

// Export/Import utilities
export const exportAll = async () => {
  const data = await db.transaction('r', db.tables, async () => ({
    customers: await db.customers.toArray(),
    suppliers: await db.suppliers.toArray(),
    parts: await db.parts.toArray(),
    stockMoves: await db.stockMoves.toArray(),
    jobs: await db.jobs.toArray(),
    payments: await db.payments.toArray(),
    quotes: await db.quotes.toArray(),
    sales: await db.sales.toArray(),
    expenses: await db.expenses.toArray(),
    closeDays: await db.closeDays.toArray(),
    users: await db.users.toArray(),
    settings: await db.settings.toArray(),
    counters: await db.counters.toArray()
  }));
  return data;
};

export const importAll = async (dump: any) => {
  await db.transaction('rw', db.tables, async () => {
    // Clear all
    await Promise.all(db.tables.map(t => t.clear()));
    // Import
    if (dump.customers) await db.customers.bulkAdd(dump.customers);
    if (dump.suppliers) await db.suppliers.bulkAdd(dump.suppliers);
    if (dump.parts) await db.parts.bulkAdd(dump.parts);
    if (dump.stockMoves) await db.stockMoves.bulkAdd(dump.stockMoves);
    if (dump.jobs) await db.jobs.bulkAdd(dump.jobs);
    if (dump.payments) await db.payments.bulkAdd(dump.payments);
    if (dump.quotes) await db.quotes.bulkAdd(dump.quotes);
    if (dump.sales) await db.sales.bulkAdd(dump.sales);
    if (dump.expenses) await db.expenses.bulkAdd(dump.expenses);
    if (dump.closeDays) await db.closeDays.bulkAdd(dump.closeDays);
    if (dump.users) await db.users.bulkAdd(dump.users);
    if (dump.settings) await db.settings.bulkAdd(dump.settings);
    if (dump.counters) await db.counters.bulkAdd(dump.counters);
    if (dump.activityLogs) await db.activityLogs.bulkAdd(dump.activityLogs);
  });
};

// Initialize database on load
seedDatabase().catch(console.error);