// Mobile Repair Pro - Zustand Store
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Customer, Job, Part, Payment, Settings, JobFilters, DashboardSummary } from '@/types';
import { db, generateJobId, generateCustomerId, generatePartId, generatePaymentId } from '@/lib/database';

interface RepairState {
  // Data
  customers: Customer[];
  jobs: Job[];
  parts: Part[];
  payments: Payment[];
  settings: Settings | null;
  
  // UI State
  isLoading: boolean;
  currentUser: string | null;
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
  loadSettings: () => Promise<void>;
  
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
      settings: null,
      isLoading: false,
      currentUser: localStorage.getItem('repairpro_user') || null,
      filters: {},
      
      // Authentication (Simple demo)
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        
        // Demo authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (username === 'admin' && password === 'admin') {
          const user = 'ผู้ดูแลระบบ';
          localStorage.setItem('repairpro_user', user);
          set({ currentUser: user, isLoading: false });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },
      
      logout: () => {
        localStorage.removeItem('repairpro_user');
        set({ currentUser: null });
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
            get().loadSettings()
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
      
      loadSettings: async () => {
        const settings = await db.settings.get('default');
        set({ settings: settings || null });
      },
      
      // Customer Actions
      createCustomer: async (customerData) => {
        const customer: Customer = {
          id: generateCustomerId(),
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.customers.add(customer);
        await get().loadCustomers();
        return customer;
      },
      
      updateCustomer: async (id, updates) => {
        await db.customers.update(id, { ...updates, updatedAt: new Date() });
        await get().loadCustomers();
      },
      
      deleteCustomer: async (id) => {
        await db.customers.delete(id);
        await get().loadCustomers();
      },
      
      // Job Actions
      createJob: async (jobData) => {
        const job: Job = {
          id: await generateJobId(),
          ...jobData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.jobs.add(job);
        await get().loadJobs();
        return job;
      },
      
      updateJob: async (id, updates) => {
        await db.jobs.update(id, { ...updates, updatedAt: new Date() });
        await get().loadJobs();
      },
      
      deleteJob: async (id) => {
        await db.jobs.delete(id);
        await get().loadJobs();
      },
      
      updateJobStatus: async (id, status) => {
        const updates: Partial<Job> = { status, updatedAt: new Date() };
        if (status === 'done') {
          updates.completedAt = new Date();
        }
        await db.jobs.update(id, updates);
        await get().loadJobs();
      },
      
      updatePaymentStatus: async (id, paymentStatus) => {
        await db.jobs.update(id, { paymentStatus, updatedAt: new Date() });
        await get().loadJobs();
      },
      
      // Part Actions
      createPart: async (partData) => {
        const part: Part = {
          id: generatePartId(),
          ...partData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.parts.add(part);
        await get().loadParts();
        return part;
      },
      
      updatePart: async (id, updates) => {
        await db.parts.update(id, { ...updates, updatedAt: new Date() });
        await get().loadParts();
      },
      
      deletePart: async (id) => {
        await db.parts.delete(id);
        await get().loadParts();
      },
      
      // Payment Actions
      createPayment: async (paymentData) => {
        const payment: Payment = {
          id: generatePaymentId(),
          ...paymentData,
          createdAt: new Date()
        };
        
        await db.payments.add(payment);
        await get().loadPayments();
        return payment;
      },
      
      deletePayment: async (id) => {
        await db.payments.delete(id);
        await get().loadPayments();
      },
      
      // Settings Actions
      updateSettings: async (updates) => {
        const current = get().settings;
        if (current) {
          await db.settings.update('default', { ...updates, updatedAt: new Date() });
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
          await db.settings.add(newSettings);
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
            ['received', 'in_progress', 'waiting_parts'].includes(job.status)
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