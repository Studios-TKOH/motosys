import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database Schema Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Motorcycle {
  id: string;
  customerId: string;
  shopCode: string; // MT-000001
  brand: string;
  model: string;
  year?: number;
  color?: string;
  vinChasis?: string;
  engineNumber?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  minStock: number;
  ean?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StockBalance {
  partId: string;
  quantity: number;
  updatedAt: number;
}

export interface InventoryMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  reference?: string;
  notes?: string;
  createdAt: number;
}

export interface InventoryMovementLine {
  id: string;
  movementId: string;
  partId: string;
  quantity: number;
  unitPrice?: number;
}

export interface WorkOrder {
  id: string;
  motorcycleId: string;
  customerId: string;
  number: string; // OT-000001
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';
  description: string;
  startDate: number;
  completionDate?: number;
  deliveryDate?: number;
  totalAmount: number;
  createdAt: number;
  updatedAt: number;
}

export interface WorkOrderService {
  id: string;
  workOrderId: string;
  description: string;
  price: number;
  completed: boolean;
}

export interface WorkOrderPart {
  id: string;
  workOrderId: string;
  partId: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  motorcycleId?: string;
  number: string; // V-000001
  type: 'PRODUCT' | 'SERVICE' | 'MIXED';
  totalAmount: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  createdAt: number;
  updatedAt: number;
}

export interface SaleItem {
  id: string;
  saleId: string;
  type: 'PRODUCT' | 'SERVICE';
  itemId?: string; // partId for products
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AccountReceivable {
  id: string;
  saleId?: string;
  workOrderId?: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: number;
  status: 'PENDING' | 'OVERDUE' | 'PAID';
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  accountReceivableId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  notes?: string;
  createdAt: number;
}

export interface Sequence {
  name: string;
  value: number;
}

interface TallerMotosDB extends DBSchema {
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-phone': string };
  };
  motorcycles: {
    key: string;
    value: Motorcycle;
    indexes: { 'by-customer': string; 'by-shopCode': string };
  };
  parts: {
    key: string;
    value: Part;
    indexes: { 'by-sku': string; 'by-ean': string };
  };
  stockBalances: {
    key: string;
    value: StockBalance;
  };
  inventoryMovements: {
    key: string;
    value: InventoryMovement;
    indexes: { 'by-date': number };
  };
  inventoryMovementLines: {
    key: string;
    value: InventoryMovementLine;
    indexes: { 'by-movement': string };
  };
  workOrders: {
    key: string;
    value: WorkOrder;
    indexes: { 'by-motorcycle': string; 'by-status': string; 'by-number': string };
  };
  workOrderServices: {
    key: string;
    value: WorkOrderService;
    indexes: { 'by-workOrder': string };
  };
  workOrderParts: {
    key: string;
    value: WorkOrderPart;
    indexes: { 'by-workOrder': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-customer': string; 'by-number': string; 'by-date': number };
  };
  saleItems: {
    key: string;
    value: SaleItem;
    indexes: { 'by-sale': string };
  };
  accountsReceivable: {
    key: string;
    value: AccountReceivable;
    indexes: { 'by-customer': string; 'by-status': string; 'by-dueDate': number };
  };
  payments: {
    key: string;
    value: Payment;
    indexes: { 'by-account': string };
  };
  sequences: {
    key: string;
    value: Sequence;
  };
}

let dbInstance: IDBPDatabase<TallerMotosDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<TallerMotosDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TallerMotosDB>('taller-motos-db', 1, {
    upgrade(db) {
      // Customers
      if (!db.objectStoreNames.contains('customers')) {
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('by-phone', 'phone');
      }

      // Motorcycles
      if (!db.objectStoreNames.contains('motorcycles')) {
        const motorcycleStore = db.createObjectStore('motorcycles', { keyPath: 'id' });
        motorcycleStore.createIndex('by-customer', 'customerId');
        motorcycleStore.createIndex('by-shopCode', 'shopCode', { unique: true });
      }

      // Parts
      if (!db.objectStoreNames.contains('parts')) {
        const partStore = db.createObjectStore('parts', { keyPath: 'id' });
        partStore.createIndex('by-sku', 'sku', { unique: true });
        partStore.createIndex('by-ean', 'ean');
      }

      // Stock Balances
      if (!db.objectStoreNames.contains('stockBalances')) {
        db.createObjectStore('stockBalances', { keyPath: 'partId' });
      }

      // Inventory Movements
      if (!db.objectStoreNames.contains('inventoryMovements')) {
        const movementStore = db.createObjectStore('inventoryMovements', { keyPath: 'id' });
        movementStore.createIndex('by-date', 'createdAt');
      }

      // Inventory Movement Lines
      if (!db.objectStoreNames.contains('inventoryMovementLines')) {
        const lineStore = db.createObjectStore('inventoryMovementLines', { keyPath: 'id' });
        lineStore.createIndex('by-movement', 'movementId');
      }

      // Work Orders
      if (!db.objectStoreNames.contains('workOrders')) {
        const woStore = db.createObjectStore('workOrders', { keyPath: 'id' });
        woStore.createIndex('by-motorcycle', 'motorcycleId');
        woStore.createIndex('by-status', 'status');
        woStore.createIndex('by-number', 'number', { unique: true });
      }

      // Work Order Services
      if (!db.objectStoreNames.contains('workOrderServices')) {
        const serviceStore = db.createObjectStore('workOrderServices', { keyPath: 'id' });
        serviceStore.createIndex('by-workOrder', 'workOrderId');
      }

      // Work Order Parts
      if (!db.objectStoreNames.contains('workOrderParts')) {
        const partStore = db.createObjectStore('workOrderParts', { keyPath: 'id' });
        partStore.createIndex('by-workOrder', 'workOrderId');
      }

      // Sales
      if (!db.objectStoreNames.contains('sales')) {
        const saleStore = db.createObjectStore('sales', { keyPath: 'id' });
        saleStore.createIndex('by-customer', 'customerId');
        saleStore.createIndex('by-number', 'number', { unique: true });
        saleStore.createIndex('by-date', 'createdAt');
      }

      // Sale Items
      if (!db.objectStoreNames.contains('saleItems')) {
        const itemStore = db.createObjectStore('saleItems', { keyPath: 'id' });
        itemStore.createIndex('by-sale', 'saleId');
      }

      // Accounts Receivable
      if (!db.objectStoreNames.contains('accountsReceivable')) {
        const arStore = db.createObjectStore('accountsReceivable', { keyPath: 'id' });
        arStore.createIndex('by-customer', 'customerId');
        arStore.createIndex('by-status', 'status');
        arStore.createIndex('by-dueDate', 'dueDate');
      }

      // Payments
      if (!db.objectStoreNames.contains('payments')) {
        const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
        paymentStore.createIndex('by-account', 'accountReceivableId');
      }

      // Sequences
      if (!db.objectStoreNames.contains('sequences')) {
        db.createObjectStore('sequences', { keyPath: 'name' });
      }
    },
  });

  return dbInstance;
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getNextSequence(name: string): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('sequences', 'readwrite');
  const store = tx.objectStore('sequences');
  
  const current = await store.get(name);
  const nextValue = current ? current.value + 1 : 1;
  
  await store.put({ name, value: nextValue });
  await tx.done;
  
  return nextValue;
}

export function formatShopCode(num: number): string {
  return `MT-${num.toString().padStart(6, '0')}`;
}

export function formatWorkOrderNumber(num: number): string {
  return `OT-${num.toString().padStart(6, '0')}`;
}

export function formatSaleNumber(num: number): string {
  return `V-${num.toString().padStart(6, '0')}`;
}
