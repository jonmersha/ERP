-- Generated SQL Schema from Firestore Blueprint

CREATE TABLE Companies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logoUrl TEXT,
    bannerUrl TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ownerId VARCHAR(255) NOT NULL
);

CREATE TABLE Users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    roles TEXT,
    unitId VARCHAR(255),
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE Factories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE Warehouses (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    factoryId VARCHAR(255),
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE SalesOutlets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE Suppliers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE RawMaterials (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE Products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    packageSize VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE Inventory (
    id VARCHAR(255) PRIMARY KEY,
    unitId VARCHAR(255) NOT NULL,
    itemId VARCHAR(255) NOT NULL,
    itemType VARCHAR(50) NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    batchNumber VARCHAR(100),
    expiryDate TIMESTAMP,
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE PurchaseOrders (
    id VARCHAR(255) PRIMARY KEY,
    supplierId VARCHAR(255) NOT NULL,
    factoryId VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    totalAmount DECIMAL(15, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    companyId VARCHAR(255) NOT NULL
);

CREATE TABLE ProductionPlans (
    id VARCHAR(255) PRIMARY KEY,
    factoryId VARCHAR(255) NOT NULL,
    productId VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    totalQuantity DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    companyId VARCHAR(255) NOT NULL
);
