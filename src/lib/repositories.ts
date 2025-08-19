import type {
    ActivityLog,
    CloseDay,
    Customer,
    Expense,
    GoodsReceipt,
    Job,
    Part,
    Payment,
    PurchaseOrder,
    Quote,
    Sale,
    Settings,
    StockMove,
    Supplier,
    User
} from '@/types';
import Dexie from 'dexie';
import { db } from './database';

// Generic typed repositories for basic CRUD
type EntityWithId<T> = T & { id: string };

const makeRepo = <T extends { id: string }>(table: Dexie.Table<T, string>) => ({
	add: (entity: T) => table.add(entity),
	bulkAdd: (entities: T[]) => table.bulkAdd(entities),
	update: (id: string, changes: Partial<T>) => table.update(id, changes as any),
	delete: (id: string) => table.delete(id),
	get: (id: string) => table.get(id),
	all: () => table.toArray()
});

export const customerRepo = makeRepo<Customer>(db.customers);
export const jobRepo = makeRepo<Job>(db.jobs);
export const partRepo = makeRepo<Part>(db.parts);
export const paymentRepo = makeRepo<Payment>(db.payments);
export const settingsRepo = makeRepo<Settings>(db.settings);
export const supplierRepo = makeRepo<Supplier>(db.suppliers);
export const stockMoveRepo = makeRepo<StockMove>(db.stockMoves);
export const quoteRepo = makeRepo<Quote>(db.quotes);
export const saleRepo = makeRepo<Sale>(db.sales);
export const expenseRepo = makeRepo<Expense>(db.expenses);
export const closeDayRepo = makeRepo<CloseDay>(db.closeDays);
export const userRepo = makeRepo<User>(db.users);
export const poRepo = makeRepo<PurchaseOrder>(db.purchaseOrders);
export const grRepo = makeRepo<GoodsReceipt>(db.goodsReceipts);
export const activityRepo = makeRepo<ActivityLog>(db.activityLogs);

// minor helper for CloseDay upsert in case of same-date overwrite
(closeDayRepo as any).put = (payload: CloseDay) => db.closeDays.put(payload);


