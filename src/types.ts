export type UserRole = 'admin' | 'finance' | 'store' | 'procurement' | 'sales' | 'factory_manager';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  unitId?: string;
}

export interface Factory {
  id: string;
  name: string;
  location: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  factoryId?: string;
}

export interface SalesOutlet {
  id: string;
  name: string;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: 'kg' | 'liter' | 'unit' | 'bag';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  packageSize: string;
  unit: string;
  price: number;
}

export interface InventoryItem {
  id: string;
  unitId: string;
  itemId: string;
  itemType: 'raw' | 'product';
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  factoryId: string;
  warehouseId: string;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
}

export interface SalesOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface SalesOrder {
  id: string;
  customerId?: string;
  outletId: string;
  outletName: string;
  status: 'pending' | 'paid' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  items: SalesOrderItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
}

export interface ProductionPlan {
  id: string;
  factoryId: string;
  productId: string;
  quantity: number;
  status: 'planned' | 'in_progress' | 'completed';
  startDate: string;
}

export interface GRNItem {
  itemId: string;
  quantityReceived: number;
}

export interface GRN {
  id: string;
  purchaseOrderId: string;
  warehouseId: string;
  receivedBy: string;
  receivedAt: string;
  items: GRNItem[];
  notes?: string;
}

export interface DeliveryNoteItem {
  productId: string;
  quantityShipped: number;
}

export interface DeliveryNote {
  id: string;
  salesOrderId: string;
  warehouseId: string;
  shippedBy: string;
  shippedAt: string;
  items: DeliveryNoteItem[];
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  factoryId?: string;
  hireDate: string;
}
