import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/procurement:
 *   get:
 *     summary: Retrieve procurement plans
 *     responses:
 *       200:
 *         description: Procurement plans list
 *   post:
 *     summary: Create a new procurement plan
 *     responses:
 *       201:
 *         description: Procurement plan created
 * /api/procurement/{id}:
 *   put:
 *     summary: Update a procurement plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procurement plan updated
 *   delete:
 *     summary: Delete a procurement plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procurement plan deleted
 */
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM purchase_orders';
    let params = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    const [rows] = await pool.query(query, params);
    
    // map snake_case to camelCase
    const mappedRows = rows.map(row => ({
      ...row,
      companyId: row.company_id,
      supplierId: row.supplier_id,
      factoryId: row.factory_id,
      warehouseId: row.warehouse_id,
      totalAmount: row.total_amount,
      createdAt: row.created_at
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

export const createPurchaseOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      id, 
      supplierId, supplier_id, 
      factoryId, factory_id,
      warehouseId, warehouse_id,
      status, 
      totalAmount, total_amount, 
      companyId, company_id,
      items 
    } = req.body;

    const orderId = id || crypto.randomUUID();
    const finalSupplierId = supplierId || supplier_id;
    const finalFactoryId = factoryId || factory_id;
    const finalWarehouseId = warehouseId || warehouse_id;
    const finalTotalAmount = totalAmount || total_amount;
    const finalCompanyId = companyId || company_id;

    await connection.query(
      'INSERT INTO purchase_orders (id, supplier_id, factory_id, warehouse_id, status, total_amount, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderId, finalSupplierId, finalFactoryId, finalWarehouseId, status || 'pending', finalTotalAmount, finalCompanyId]
    );

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'INSERT INTO purchase_order_items (order_id, item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.itemId || item.item_id, item.itemName || item.item_name, item.quantity, item.price]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ id: orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  } finally {
    connection.release();
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      supplierId, supplier_id, 
      factoryId, factory_id, 
      warehouseId, warehouse_id, 
      status, 
      totalAmount, total_amount 
    } = req.body;

    const finalSupplierId = supplierId || supplier_id;
    const finalFactoryId = factoryId || factory_id;
    const finalWarehouseId = warehouseId || warehouse_id;
    const finalTotalAmount = totalAmount || total_amount;

    await pool.query(
      'UPDATE purchase_orders SET supplier_id = ?, factory_id = ?, warehouse_id = ?, status = ?, total_amount = ? WHERE id = ?',
      [finalSupplierId, finalFactoryId, finalWarehouseId, status, finalTotalAmount, id]
    );
    res.json({ message: 'Purchase order updated' });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM purchase_orders WHERE id = ?', [id]);
    res.json({ message: 'Purchase order deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
};
