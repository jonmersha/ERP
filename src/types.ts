export type UserRole = 'admin' | 'finance' | 'store' | 'procurement' | 'sales' | 'factory_manager';

export interface Company {
  id: string;
  name: string;
  code: string; // Unique code for users to join
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  bannerUrl?: string;
  createdAt: string;
  ownerId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  roles: UserRole[];
  unitId?: string;
  companyId: string;
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  companyId: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  factoryId?: string;
  companyId: string;
}

export interface SalesOutlet {
  id: string;
  name: string;
  location: string;
  companyId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  companyId: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: 'kg' | 'liter' | 'unit' | 'bag';
  companyId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  companyId: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  packageSize: string;
  unit: string;
  price: number;
  companyId: string;
}

export interface InventoryItem {
  id: string;
  unitId: string;
  itemId: string;
  itemType: 'raw' | 'product';
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  companyId: string;
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
  companyId: string;
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
  companyId: string;
}

export interface ProductionPlan {
  id: string;
  factoryId: string;
  productId: string;
  productType: string;
  year: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  month?: number; // 1-12
  day?: number; // 1-31
  quantity: number;
  quantityProduced: number; // Progress tracking
  status: 'planned' | 'in_progress' | 'completed';
  companyId: string;
}

export interface ProcurementPlan {
  id: string;
  materialId: string;
  quantity: number;
  status: 'planned' | 'ordered' | 'received';
  year: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  month?: number; // 1-12
  companyId: string;
}

export interface SalesPlan {
  id: string;
  productId: string;
  targetQuantity: number;
  year: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  month?: number; // 1-12
  status: 'draft' | 'approved';
  companyId: string;
}

export interface BOMItem {
  materialId: string;
  quantity: number;
  unit: string;
}

export interface ProcessingStep {
  order: number;
  description: string;
  durationMinutes: number;
}

export interface Recipe {
  id: string;
  productId: string;
  name: string;
  bom: BOMItem[];
  processingSteps: ProcessingStep[];
  yieldPercentage: number;
  companyId: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: 'operational' | 'maintenance' | 'broken';
  companyId: string;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  date: string;
  description: string;
  technician: string;
  cost: number;
  companyId: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  status: 'pending' | 'in_transit' | 'delivered';
  deliveryDate: string;
  temperatureLog: number[]; // For cold chain monitoring
  companyId: string;
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
  companyId: string;
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
  companyId: string;
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
  companyId: string;
}
