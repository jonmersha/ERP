-- Comprehensive SQL Schema for Food Tech ERP
-- Compatible with MySQL and PostgreSQL

-- 1. Companies (Tenants)
CREATE TABLE companies (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    owner_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Organizations Units (Factories, Warehouses, Outlets)
CREATE TABLE org_units (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('factory', 'warehouse', 'outlet') NOT NULL,
    location TEXT,
    parent_unit_id VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 3. Users
CREATE TABLE users (
    uid VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    roles TEXT, -- JSON array of roles
    unit_id VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES org_units(id) ON DELETE SET NULL
);

-- 4. Catalog (Products and Materials)
CREATE TABLE catalog_items (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('raw_material', 'finished_product') NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50), -- kg, liter, unit
    price DECIMAL(15, 2) DEFAULT 0,
    package_size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 5. Inventory
CREATE TABLE inventory (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    unit_id VARCHAR(128) NOT NULL,
    item_id VARCHAR(128) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL DEFAULT 0,
    batch_number VARCHAR(100),
    expiry_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES org_units(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE
);

-- 6. Production Plans
CREATE TABLE production_plans (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    factory_id VARCHAR(128) NOT NULL,
    product_id VARCHAR(128) NOT NULL,
    year INT NOT NULL,
    total_quantity DECIMAL(15, 2) NOT NULL,
    quarterly_data JSON, -- Stores the nested Q/M structure
    status ENUM('planned', 'in_progress', 'completed') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (factory_id) REFERENCES org_units(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES catalog_items(id) ON DELETE CASCADE
);

-- 7. Sales and Purchase Orders
CREATE TABLE orders (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    type ENUM('sales', 'purchase') NOT NULL,
    unit_id VARCHAR(128) NOT NULL, -- Target factory or source outlet
    peer_id VARCHAR(128), -- Supplier ID or Customer ID (if tracked)
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES org_units(id) ON DELETE CASCADE
);

-- Seed Data (Example for local testing)
INSERT INTO companies (id, name, code, owner_id) VALUES ('comp_1', 'Demo Global Foods', 'DEMO123', 'admin_uid');
INSERT INTO org_units (id, company_id, name, type, location) VALUES ('unit_1', 'comp_1', 'London Factory', 'factory', 'Central London');
INSERT INTO catalog_items (id, company_id, name, type, unit, price) VALUES ('prod_1', 'comp_1', 'Organic Flour 1kg', 'finished_product', 'kg', 2.50);
