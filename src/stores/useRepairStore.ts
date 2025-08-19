// Mobile Repair Pro - Zustand Store
import { db, genCode, uid } from '@/lib/database';
import { activityRepo, customerRepo, expenseRepo, grRepo, jobRepo, partRepo, paymentRepo, poRepo, saleRepo, settingsRepo, stockMoveRepo, supplierRepo, userRepo } from '@/lib/repositories';
import { ActivityLog, Customer, DashboardSummary, Expense, GoodsReceipt, Job, JobFilters, Part, Payment, PurchaseOrder, Sale, Settings, Supplier, User } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RepairState {
  // Data
  customers: Customer[];
  jobs: Job[];
  parts: Part[];
  payments: Payment[];
  sales: Sale[];
  expenses: Expense[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  users: User[];
  settings: Settings | null;
  
  // UI State
  isLoading: boolean;
  currentUser: string | null;
  currentRole: 'owner' | 'cashier' | 'tech' | 'staff' | null;
  filters: JobFilters;
  
  // Actions - Authentication
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Actions - Data Loading
  loadAllData: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadJobs: () => Promise<void>;
  loadParts: () => Promise<void>;
  loadPayments: () => Promise<void>;
  loadSales: () => Promise<void>;
  loadExpenses: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadPOs: () => Promise<void>;
  loadGRs: () => Promise<void>;
  loadSettings: () => Promise<void>;
  loadUsers: () => Promise<void>;
  
  // Actions - Customers
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Actions - Jobs
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  updateJobStatus: (id: string, status: Job['status']) => Promise<void>;
  updatePaymentStatus: (id: string, paymentStatus: Job['paymentStatus']) => Promise<void>;
  
  // Actions - Parts
  createPart: (part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Part>;
  updatePart: (id: string, updates: Partial<Part>) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  
  // Actions - Payments
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<Payment>;
  deletePayment: (id: string) => Promise<void>;
  // Sales
  createSale: (sale: Omit<Sale, 'id'>) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  // Expenses
  createExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  createSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  createPO: (po: PurchaseOrder) => Promise<void>;
  updatePO: (id: string, changes: Partial<PurchaseOrder>) => Promise<void>;
  createGR: (gr: GoodsReceipt) => Promise<void>;
  // Users
  createUser: (user: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: string, changes: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  // Activity Log
  log: (log: Omit<ActivityLog, 'id' | 'at'>) => Promise<void>;
  
  // Actions - Settings
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  
  // Actions - Filters
  setFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  
  // Getters
  getFilteredJobs: () => Job[];
  getJobsByCustomer: (customerId: string) => Job[];
  getJobById: (id: string) => Job | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getDashboardSummary: () => DashboardSummary;
}

export const useRepairStore = create<RepairState>()(
  devtools(
    (set, get) => ({
      // Initial State
      customers: [],
      jobs: [],
      parts: [],
      payments: [],
      sales: [],
      expenses: [],
      suppliers: [],
      purchaseOrders: [],
      goodsReceipts: [],
      users: [],
      settings: null,
      isLoading: false,
      currentUser: localStorage.getItem('repairpro_user') || null,
      currentRole: (localStorage.getItem('repairpro_role') as any) || null,
      filters: {},
      
      // Authentication (Simple demo)
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        
        // Demo authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const roleMap: Record<string, 'owner'|'cashier'|'tech'|'staff'> = {
          admin: 'owner',
          cashier: 'cashier',
          tech: 'tech',
          staff: 'staff'
        };
        const role = roleMap[username as keyof typeof roleMap];
        if (role && password === username) {
          const user = username;
          localStorage.setItem('repairpro_user', user);
          localStorage.setItem('repairpro_role', role);
          set({ currentUser: user, currentRole: role, isLoading: false });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },
      
      logout: () => {
        localStorage.removeItem('repairpro_user');
        localStorage.removeItem('repairpro_role');
        set({ currentUser: null, currentRole: null });
      },
      
      // Data Loading
      loadAllData: async () => {
        set({ isLoading: true });
        try {
          await Promise.all([
            get().loadCustomers(),
            get().loadJobs(),
            get().loadParts(),
            get().loadPayments(),
            get().loadSales(),
            get().loadExpenses(),
            get().loadSuppliers(),
            get().loadPOs(),
            get().loadGRs(),
            get().loadSettings(),
            get().loadUsers()
          ]);
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadCustomers: async () => {
        const customers = await db.customers.orderBy('createdAt').reverse().toArray();
        set({ customers });
      },
      
      loadJobs: async () => {
        const jobs = await db.jobs.orderBy('createdAt').reverse().toArray();
        set({ jobs });
      },
      
      loadParts: async () => {
        const parts = await db.parts.orderBy('name').toArray();
        set({ parts });
      },
      
      loadPayments: async () => {
        const payments = await db.payments.orderBy('paidAt').reverse().toArray();
        set({ payments });
      },

      loadSales: async () => {
        const sales = await db.sales.orderBy('date').reverse().toArray();
        set({ sales });
      },

      loadExpenses: async () => {
        const expenses = await db.expenses.orderBy('date').reverse().toArray();
        set({ expenses });
      },
      
      loadSettings: async () => {
        const settings = await db.settings.get('default');
        set({ settings: settings || null });
      },
      loadUsers: async () => {
        const users = await userRepo.all();
        set({ users });
      },
      loadSuppliers: async () => {
        const suppliers = await supplierRepo.all();
        set({ suppliers });
      },
      loadPOs: async () => {
        const purchaseOrders = await poRepo.all();
        set({ purchaseOrders });
      },
      loadGRs: async () => {
        const goodsReceipts = await grRepo.all();
        set({ goodsReceipts });
      },
      
      // Customer Actions
      createCustomer: async (customerData) => {
        const customer: Customer = {
          id: uid('C_'),
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await customerRepo.add(customer);
        await get().loadCustomers();
        return customer;
      },
      
      updateCustomer: async (id, updates) => {
        await customerRepo.update(id, { ...updates, updatedAt: new Date() });
        await get().loadCustomers();
      },
      
      deleteCustomer: async (id) => {
        await customerRepo.delete(id);
        await get().loadCustomers();
      },
      
      // Job Actions
      createJob: async (jobData) => {
        const job: Job = {
          id: await genCode('R'),
          code: undefined,
          ...jobData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await jobRepo.add(job);
        await get().loadJobs();
        return job;
      },
      
      updateJob: async (id, updates) => {
        await jobRepo.update(id, { ...updates, updatedAt: new Date() });
        await get().loadJobs();
      },
      
      deleteJob: async (id) => {
        await jobRepo.delete(id);
        await get().loadJobs();
      },
      
      updateJobStatus: async (id, status) => {
        const updates: Partial<Job> = { status, updatedAt: new Date() };
        if (status === 'done') {
          updates.completedAt = new Date();
        }
        await jobRepo.update(id, updates);
        await get().loadJobs();
      },
      
      updatePaymentStatus: async (id, paymentStatus) => {
        await jobRepo.update(id, { paymentStatus, updatedAt: new Date() });
        await get().loadJobs();
      },
      
      // Part Actions
      createPart: async (partData) => {
        const part: Part = {
          id: uid('P_'),
          ...partData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await partRepo.add(part);
        await get().loadParts();
        return part;
      },
      
      updatePart: async (id, updates) => {
        await partRepo.update(id, { ...updates, updatedAt: new Date() });
        await get().loadParts();
      },
      
      deletePart: async (id) => {
        await partRepo.delete(id);
        await get().loadParts();
      },
      
      // Payment Actions
      createPayment: async (paymentData) => {
        const payment: Payment = {
          id: uid('PAY_'),
          ...paymentData,
          createdAt: new Date()
        };
        
        await paymentRepo.add(payment);
        await get().loadPayments();
        return payment;
      },
      
      deletePayment: async (id) => {
        await paymentRepo.delete(id);
        await get().loadPayments();
      },

      // Sales Actions
      createSale: async (saleData) => {
        const sale: Sale = { id: uid('SO_'), ...saleData };
        await saleRepo.add(sale);
        await get().loadSales();
        return sale;
      },
      deleteSale: async (id) => {
        await saleRepo.delete(id);
        await get().loadSales();
      },

      // Expense Actions
      createExpense: async (expenseData) => {
        const expense: Expense = { id: uid('EX_'), ...expenseData };
        await expenseRepo.add(expense);
        await get().loadExpenses();
        return expense;
      },
      deleteExpense: async (id) => {
        await expenseRepo.delete(id);
        await get().loadExpenses();
        await get().log({ type: 'delete', entity: 'expense', entityId: id, userId: get().currentUser || 'system' } as any);
      },
      createSupplier: async (data) => {
        const supplier: Supplier = { id: uid('S_'), ...data, createdAt: new Date() } as Supplier;
        await supplierRepo.add(supplier);
        await get().loadSuppliers();
        return supplier;
      },
      updateSupplier: async (id, data) => {
        await supplierRepo.update(id, data);
        await get().loadSuppliers();
      },
      deleteSupplier: async (id) => {
        await supplierRepo.delete(id);
        await get().loadSuppliers();
      },
      createPO: async (po) => {
        await poRepo.add(po);
        await get().loadPOs();
      },
      updatePO: async (id, changes) => {
        await poRepo.update(id, changes);
        await get().loadPOs();
      },
      createGR: async (gr) => {
        await grRepo.add(gr);
        for (const it of gr.items) {
          const part = await partRepo.get(it.partId);
          if (!part) continue;
          const newStock = (part.stock || 0) + it.qty;
          const avgCost = Math.round(((part.stock * part.cost) + (it.qty * it.unitCost)) / newStock);
          await stockMoveRepo.add({ id: uid('SM_'), partId: part.id, type: 'receive', qty: it.qty, unitCost: it.unitCost, ref: gr.id, createdAt: new Date() });
          await partRepo.update(part.id, { stock: newStock, cost: avgCost, updatedAt: new Date() });
        }
        await Promise.all([get().loadGRs(), get().loadParts()]);
        await get().log({ type: 'create', entity: 'goodsReceipt', entityId: gr.id, userId: get().currentUser || 'system' } as any);
      },

      // Users
      createUser: async (userData) => {
        const user: User = { id: uid('U_'), ...userData } as User;
        await userRepo.add(user);
        await get().loadUsers();
        return user;
      },
      updateUser: async (id, changes) => {
        await userRepo.update(id, changes);
        await get().loadUsers();
      },
      deleteUser: async (id) => {
        await userRepo.delete(id);
        await get().loadUsers();
      },

      // Activity log
      log: async (entry) => {
        const log: ActivityLog = { id: uid('LOG_'), at: new Date(), ...entry } as ActivityLog;
        await activityRepo.add(log);
      },
      
      // Settings Actions
      updateSettings: async (updates) => {
        const current = get().settings;
        if (current) {
          await settingsRepo.update('default', { ...updates, updatedAt: new Date() });
        } else {
          const newSettings: Settings = {
            id: 'default',
            storeName: 'Mobile Repair Pro',
            address: '',
            phone: '',
            profitPercentDefault: 30,
            warrantyDefaultDays: 30,
            pdpaText: '',
            termsText: '',
            printFontSize: 12,
            printMargin: 16,
            ...updates,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await settingsRepo.add(newSettings);
        }
        await get().loadSettings();
      },
      
      // Filter Actions
      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } });
      },
      
      clearFilters: () => {
        set({ filters: {} });
      },
      
      // Getters
      getFilteredJobs: () => {
        const { jobs, filters } = get();
        let filtered = jobs;
        
        if (filters.status?.length) {
          filtered = filtered.filter(job => filters.status!.includes(job.status));
        }
        
        if (filters.paymentStatus?.length) {
          filtered = filtered.filter(job => filters.paymentStatus!.includes(job.paymentStatus));
        }
        
        if (filters.technician) {
          filtered = filtered.filter(job => job.technician?.includes(filters.technician!));
        }
        
        if (filters.dateFrom) {
          filtered = filtered.filter(job => job.receivedAt >= filters.dateFrom!);
        }
        
        if (filters.dateTo) {
          filtered = filtered.filter(job => job.receivedAt <= filters.dateTo!);
        }
        
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(job => 
            job.id.toLowerCase().includes(search) ||
            job.brand.toLowerCase().includes(search) ||
            job.model.toLowerCase().includes(search) ||
            job.issueDesc.toLowerCase().includes(search) ||
            get().getCustomerById(job.customerId)?.name.toLowerCase().includes(search) ||
            get().getCustomerById(job.customerId)?.phone.includes(search)
          );
        }
        
        return filtered;
      },
      
      getJobsByCustomer: (customerId) => {
        return get().jobs.filter(job => job.customerId === customerId);
      },
      
      getJobById: (id) => {
        return get().jobs.find(job => job.id === id);
      },
      
      getCustomerById: (id) => {
        return get().customers.find(customer => customer.id === id);
      },
      
      getDashboardSummary: () => {
        const { jobs } = get();
        const now = new Date();
        
        return {
          totalJobs: jobs.length,
          completedJobs: jobs.filter(job => job.status === 'done').length,
          paidJobs: jobs.filter(job => job.paymentStatus === 'paid').length,
          totalRevenue: jobs
            .filter(job => job.paymentStatus === 'paid')
            .reduce((sum, job) => sum + job.total, 0),
          totalProfit: jobs
            .filter(job => job.paymentStatus === 'paid')
            .reduce((sum, job) => sum + job.profit, 0),
          pendingJobs: jobs.filter(job => 
            ['received', 'checking', 'waiting_parts', 'in_progress', 'testing'].includes(job.status)
          ).length,
          overdueJobs: jobs.filter(job => 
            job.dueAt && job.dueAt < now && job.status !== 'done'
          ).length
        };
      }
    }),
    { name: 'repair-store' }
  )
);