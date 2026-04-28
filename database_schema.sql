-- Relational Database Schema for Food Manufacturing ERP
-- Compatible with PostgreSQL

-- Companies (Tenants)
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    uid VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    roles TEXT[] NOT NULL, -- Array of roles
    unit_id VARCHAR(36), -- ID of factory, warehouse, or outlet
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Factories
CREATE TABLE factories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Warehouses
CREATE TABLE warehouses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    factory_id VARCHAR(36) REFERENCES factories(id) ON DELETE SET NULL,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Sales Outlets
CREATE TABLE sales_outlets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Suppliers
CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Raw Materials
CREATE TABLE raw_materials (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'liter', 'unit', 'bag')),
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Products (Finished Goods)
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    package_size VARCHAR(50) NOT NULL,
    unit VARCHAR(20),
    price DECIMAL(12, 2) NOT NULL,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Inventory
CREATE TABLE inventory (
    id VARCHAR(36) PRIMARY KEY,
    unit_id VARCHAR(36) NOT NULL, -- Can be factory, warehouse, or outlet
    item_id VARCHAR(36) NOT NULL, -- Can be raw_material or product
    item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('raw', 'product')),
    quantity DECIMAL(12, 3) NOT NULL DEFAULT 0,
    batch_number VARCHAR(100),
    expiry_date TIMESTAMP WITH TIME ZONE,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id),
    factory_id VARCHAR(36) NOT NULL REFERENCES factories(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'shipped', 'received', 'cancelled')),
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Production Plans (Annual/Quarterly/Monthly)
CREATE TABLE production_plans (
    id VARCHAR(36) PRIMARY KEY,
    factory_id VARCHAR(36) NOT NULL REFERENCES factories(id),
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    year INTEGER NOT NULL,
    total_quantity DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed')),
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Quarterly Production Plans (Normalized from ProductionPlan)
CREATE TABLE quarterly_production_plans (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    quantity DECIMAL(12, 2) NOT NULL
);

-- Monthly Production Plans (Normalized from ProductionPlan)
CREATE TABLE monthly_production_plans (
    id SERIAL PRIMARY KEY,
    quarterly_plan_id INTEGER NOT NULL REFERENCES quarterly_production_plans(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    quantity DECIMAL(12, 2) NOT NULL
);

-- Production Runs (Execution)
CREATE TABLE production_runs (
    id VARCHAR(36) PRIMARY KEY,
    factory_id VARCHAR(36) NOT NULL REFERENCES factories(id),
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    recipe_id VARCHAR(36),
    quantity DECIMAL(12, 2) NOT NULL,
    quantity_produced DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Sales Orders
CREATE TABLE sales_orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    outlet_id VARCHAR(36) NOT NULL REFERENCES sales_outlets(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'ready_to_ship', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Employees
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary DECIMAL(12, 2),
    factory_id VARCHAR(36) REFERENCES factories(id) ON DELETE SET NULL,
    hire_date DATE,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Invoices
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL, -- Can be purchase_order or sales_order
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('purchase', 'sales')),
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'overdue', 'cancelled')),
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card')),
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Financial Plans
CREATE TABLE financial_plans (
    id VARCHAR(36) PRIMARY KEY,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    target_revenue DECIMAL(15, 2) NOT NULL,
    target_expense DECIMAL(15, 2) NOT NULL,
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_factories_company ON factories(company_id);
CREATE INDEX idx_inventory_unit ON inventory(unit_id);
CREATE INDEX idx_inventory_item ON inventory(item_id);
CREATE INDEX idx_production_runs_factory ON production_runs(factory_id);
CREATE INDEX idx_sales_orders_outlet ON sales_orders(outlet_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
