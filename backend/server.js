import express from 'express';
import cors from 'cors';
import { authenticateToken } from './src/middleware/auth.js';
import procurementRoutes from './src/routes/procurement.routes.js';
import salesRoutes from './src/routes/sales.routes.js';
import productionGroupRoutes from './src/routes/productionGroup.routes.js';
import grnRoutes from './src/routes/grn.routes.js';
import deliveryNoteRoutes from './src/routes/deliveryNote.routes.js';
import employeeRoutes from './src/routes/employee.routes.js';
import productRoutes from './src/routes/product.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import inventoryRoutes from './src/routes/inventory.routes.js';
import warehouseRoutes from './src/routes/warehouse.routes.js';
import companyRoutes from './src/routes/company.routes.js';
import userRoutes from './src/routes/user.routes.js';
import factoryRoutes from './src/routes/factory.routes.js';
import supplierRoutes from './src/routes/supplier.routes.js';
import purchaseOrderRoutes from './src/routes/purchaseOrder.routes.js';
import rawMaterialRoutes from './src/routes/rawMaterial.routes.js';
import outletRoutes from './src/routes/outlet.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const PORT = 4000;

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
                url: '/',
                description: 'API Server',
            },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            }
          }
        },
        security: [{
          bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const apiRouter = express.Router();

// Apply auth to all api routes
apiRouter.use(authenticateToken);

// Mount all routes on apiRouter
apiRouter.use('/companies', companyRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/factories', factoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/employees', employeeRoutes);

// Grouped Modules
apiRouter.use('/procurement', procurementRoutes);
apiRouter.use('/sales', salesRoutes);
apiRouter.use('/production', productionGroupRoutes);
apiRouter.use('/inventory', inventoryRoutes);

// Direct / Legacy aliases for fetchCollection compatibility
apiRouter.use('/suppliers', supplierRoutes);
apiRouter.use('/purchaseOrders', purchaseOrderRoutes);
apiRouter.use('/rawMaterials', rawMaterialRoutes);
apiRouter.use('/warehouses', warehouseRoutes);
apiRouter.use('/outlets', outletRoutes);
apiRouter.use('/inventoryItems', inventoryRoutes);

apiRouter.use('/grns', grnRoutes);
apiRouter.use('/deliveryNotes', deliveryNoteRoutes);

apiRouter.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount apiRouter on /api
app.use('/api', apiRouter);

// Catch-all for API 404s
apiRouter.use((req, res) => {
  console.log(`API 404 at backend: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'API route not found at backend' });
});

app.get('/', (req, res) => {
  res.send('Backend API Server running.');
});

import pool from './src/db.js';

const initDb = async () => {
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS units (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_unit_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS warehouses (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT NOT NULL,
        factory_id CHAR(36),
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_warehouse_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_outlets (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT NOT NULL,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_outlet_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255),
        email VARCHAR(255),
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_supplier_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS raw_materials (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_material_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
        id CHAR(36) PRIMARY KEY,
        supplier_id CHAR(36) NOT NULL,
        factory_id CHAR(36),
        warehouse_id CHAR(36),
        status ENUM('pending', 'approved', 'shipped', 'received', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(12, 2) NOT NULL,
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_po_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id CHAR(36) NOT NULL,
        item_id CHAR(36) NOT NULL,
        item_name VARCHAR(255),
        quantity DECIMAL(12, 2) NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        CONSTRAINT fk_poi_order FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_orders (
        id CHAR(36) PRIMARY KEY,
        customer_id CHAR(36),
        outlet_id CHAR(36),
        status ENUM('draft', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'draft',
        total_amount DECIMAL(12, 2) NOT NULL,
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_so_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
        id CHAR(36) PRIMARY KEY,
        unit_id CHAR(36) NOT NULL,
        item_id CHAR(36) NOT NULL,
        item_type ENUM('product', 'material') NOT NULL,
        quantity DECIMAL(12, 2) NOT NULL,
        batch_number VARCHAR(100),
        expiry_date DATE,
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_inv_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS production_runs (
        id CHAR(36) PRIMARY KEY,
        factory_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        recipe_id CHAR(36) NOT NULL,
        quantity_planned DECIMAL(12, 2) NOT NULL,
        quantity_produced DECIMAL(12, 2) DEFAULT 0,
        status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
        start_date DATETIME,
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_run_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        logo_url TEXT,
        owner_id VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        roles JSON NOT NULL,
        company_id CHAR(36) NOT NULL,
        unit_id CHAR(36),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS factories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT NOT NULL,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_factory_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        package_size VARCHAR(50) NOT NULL,
        unit VARCHAR(20),
        price DECIMAL(12, 2) NOT NULL,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_product_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        role VARCHAR(100),
        salary DECIMAL(12, 2),
        factory_id CHAR(36),
        hire_date DATE,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_employee_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        company_id CHAR(36) NOT NULL,
        CONSTRAINT fk_category_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
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
  `);

  await pool.query(`
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
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recipes (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        bom JSON NOT NULL,
        processing_steps JSON NOT NULL,
        yield_percentage DECIMAL(5, 2),
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_recipe_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS grns (
        id CHAR(36) PRIMARY KEY,
        purchase_order_id CHAR(36) NOT NULL,
        warehouse_id CHAR(36) NOT NULL,
        receipt_date DATETIME NOT NULL,
        status ENUM('received', 'inspected', 'rejected') DEFAULT 'received',
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_grn_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_notes (
        id CHAR(36) PRIMARY KEY,
        sales_order_id CHAR(36) NOT NULL,
        outlet_id CHAR(36) NOT NULL,
        dispatch_date DATETIME NOT NULL,
        status ENUM('dispatched', 'delivered', 'returned') DEFAULT 'dispatched',
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_dn_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS production_plans (
        id CHAR(36) PRIMARY KEY,
        factory_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        year INT NOT NULL,
        total_quantity DECIMAL(12, 2) NOT NULL,
        quarterly_plans JSON,
        status ENUM('draft', 'approved') DEFAULT 'draft',
        company_id CHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_prodplan_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  } catch(err) { console.error('DB Init error:', err); }
};
initDb();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
