import express from 'express';
import cors from 'cors';
import { authenticateToken } from './src/middleware/auth.js';
import factoryRoutes from './src/routes/factory.routes.js';
import productionRoutes from './src/routes/production.routes.js';
import companyRoutes from './src/routes/company.routes.js';
import inventoryRoutes from './src/routes/inventory.routes.js';
import salesOrderRoutes from './src/routes/salesOrder.routes.js';
import purchaseOrderRoutes from './src/routes/purchaseOrder.routes.js';
import userRoutes from './src/routes/user.routes.js';
import warehouseRoutes from './src/routes/warehouse.routes.js';
import outletRoutes from './src/routes/outlet.routes.js';
import supplierRoutes from './src/routes/supplier.routes.js';
import rawMaterialRoutes from './src/routes/rawMaterial.routes.js';
import productRoutes from './src/routes/product.routes.js';
import productionPlanRoutes from './src/routes/productionPlan.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
app.use(cors());
app.use(express.json());

// Apply authentication to all /api routes
app.use('/api', authenticateToken);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Enterprise Backend API',
            version: '1.0.0',
            description: 'API documentation for Enterprise Backend',
        },
        servers: [
            {
                url: 'http://localhost:4000',
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = parseInt(process.env.PORT || '4000', 10);

app.get('/', (req, res) => {
  res.send('Backend API Server running.');
});

app.use('/api/factories', factoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/productionRuns', productionRoutes);
app.use('/api/salesOrders', salesOrderRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesOrderRoutes);
app.use('/api/procurement', purchaseOrderRoutes);
app.use('/api/procurementPlans', purchaseOrderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/rawMaterials', rawMaterialRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/productionPlans', productionPlanRoutes);

import pool from './src/db.js';
pool.query(`
  CREATE TABLE IF NOT EXISTS categories (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      company_id CHAR(36) NOT NULL,
      CONSTRAINT fk_category_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;
`).then(() => console.log('Categories table ensured')).catch(console.error);

pool.query(`
  CREATE TABLE IF NOT EXISTS procurement_plans (
      id CHAR(36) PRIMARY KEY,
      warehouse_id CHAR(36) NOT NULL,
      material_id CHAR(36) NOT NULL,
      year INT NOT NULL,
      total_quantity DECIMAL(12, 2) NOT NULL,
      quarterly_plans JSON,
      status ENUM('planned', 'ordered', 'received', 'approved') DEFAULT 'planned',
      company_id CHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_procplan_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;
`).then(() => console.log('Procurement plans table ensured')).catch(console.error);

pool.query(`
  CREATE TABLE IF NOT EXISTS sales_plans (
      id CHAR(36) PRIMARY KEY,
      factory_id CHAR(36) NOT NULL,
      product_id CHAR(36) NOT NULL,
      year INT NOT NULL,
      total_quantity DECIMAL(12, 2) NOT NULL,
      quarterly_plans JSON,
      status ENUM('draft', 'approved') DEFAULT 'draft',
      company_id CHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_salesplan_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;
`).then(() => console.log('Sales plans table ensured')).catch(console.error);

pool.query("SHOW COLUMNS FROM production_plans LIKE 'quarterly_plans'").then(([cols]) => {
  if (cols.length === 0) {
    return pool.query("ALTER TABLE production_plans ADD COLUMN quarterly_plans JSON");
  }
}).then(() => console.log('Production plans table altered')).catch(console.error);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
