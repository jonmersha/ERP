-- ERP System Database Schema
-- Optimized for MySQL/MariaDB with support for both JSON and standard columns

CREATE DATABASE IF NOT EXISTS erpsystem;
USE erpsystem;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Companies (Root of multi-tenancy)
CREATE TABLE IF NOT EXISTS `companies` (
  `id` VARCHAR(128) PRIMARY KEY,
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (Linked to Company)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `email` VARCHAR(255),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (email),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Factories
CREATE TABLE IF NOT EXISTS `factories` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `name` VARCHAR(255),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Warehouses
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `factoryId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (factoryId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
);

-- Outlets (Sales/Distribution Points)
CREATE TABLE IF NOT EXISTS `outlets` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- ============================================================================
-- MATERIALS & PRODUCTS
-- ============================================================================

-- Raw Materials
CREATE TABLE IF NOT EXISTS `rawMaterials` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- ============================================================================
-- OPERATIONS
-- ============================================================================

-- Inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `unitId` VARCHAR(128),
  `itemId` VARCHAR(128),
  `itemType` ENUM('product', 'raw') DEFAULT 'product',
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (unitId),
  INDEX (itemId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS `purchaseOrders` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `supplierId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (supplierId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Sales Orders
CREATE TABLE IF NOT EXISTS `salesOrders` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `outletId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (outletId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (outletId) REFERENCES outlets(id) ON DELETE CASCADE
);

-- Production Runs
CREATE TABLE IF NOT EXISTS `productionRuns` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `factoryId` VARCHAR(128),
  `productId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (factoryId),
  INDEX (productId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `factoryId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (factoryId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (factoryId) REFERENCES factories(id) ON DELETE CASCADE
);

-- ============================================================================
-- PLANNING
-- ============================================================================

-- Production Plans
CREATE TABLE IF NOT EXISTS `productionPlans` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Procurement Plans
CREATE TABLE IF NOT EXISTS `procurementPlans` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Sales Plans
CREATE TABLE IF NOT EXISTS `salesPlans` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Recipes
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `productId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (productId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Goods Received Notes (GRNs)
CREATE TABLE IF NOT EXISTS `grns` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `purchaseOrderId` VARCHAR(128),
  `warehouseId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (purchaseOrderId) REFERENCES purchaseOrders(id) ON DELETE CASCADE
);

-- Delivery Notes (DNs)
CREATE TABLE IF NOT EXISTS `deliveryNotes` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `salesOrderId` VARCHAR(128),
  `warehouseId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (salesOrderId) REFERENCES salesOrders(id) ON DELETE CASCADE
);

-- End of Schema
