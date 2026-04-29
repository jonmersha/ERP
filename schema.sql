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
-- Relationship: Many Users -> One Company
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `email` VARCHAR(255),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (email)
);

-- Factories
-- Relationship: Many Factories -> One Company
CREATE TABLE IF NOT EXISTS `factories` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `name` VARCHAR(255),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
);

-- Warehouses
-- Relationship: Many Warehouses -> One Factory
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `factoryId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (factoryId)
);

-- Outlets (Sales/Distribution Points)
-- Relationship: Many Outlets -> One Company
CREATE TABLE IF NOT EXISTS `outlets` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
);

-- Suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
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
  INDEX (companyId)
);

-- Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
);

-- Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
);

-- ============================================================================
-- OPERATIONS
-- ============================================================================

-- Inventory
-- Relationship: Many Inventory Items -> One Warehouse/Outlet (unitId)
-- Relationship: Many Inventory Items -> One Product/RawMaterial (itemId)
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
  INDEX (itemId)
);

-- Purchase Orders
-- Relationship: Many POs -> One Supplier
CREATE TABLE IF NOT EXISTS `purchaseOrders` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `supplierId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (supplierId)
);

-- Sales Orders
-- Relationship: Many Sales Orders -> One Outlet
CREATE TABLE IF NOT EXISTS `salesOrders` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `outletId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (outletId)
);

-- Production Runs
-- Relationship: Many Runs -> One Factory
-- Relationship: Many Runs -> One Product
CREATE TABLE IF NOT EXISTS `productionRuns` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `factoryId` VARCHAR(128),
  `productId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (factoryId),
  INDEX (productId)
);

-- Employees
-- Relationship: Many Employees -> One Factory (Optional)
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `factoryId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (factoryId)
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
  INDEX (companyId)
);

-- Procurement Plans
CREATE TABLE IF NOT EXISTS `procurementPlans` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
);

-- Sales Plans
CREATE TABLE IF NOT EXISTS `salesPlans` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId)
);

-- Recipes
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` VARCHAR(128) PRIMARY KEY,
  `companyId` VARCHAR(128),
  `productId` VARCHAR(128),
  `data` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (companyId),
  INDEX (productId)
);
