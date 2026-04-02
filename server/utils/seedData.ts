import { prisma } from '../db';

export const seedDatabase = async (companyId: string) => {
  try {
    // Check if already seeded for this company
    const factoryCount = await prisma.factory.count({
      where: { companyId }
    });
      
    if (factoryCount > 0) return;

    console.log(`Seeding database for company ${companyId}...`);

    // 1. Factories
    const factoryA = await prisma.factory.create({ data: { companyId, name: 'Addis Flour Mill', location: 'Addis Ababa' } });
    const factoryB = await prisma.factory.create({ data: { companyId, name: 'Bishoftu Oil Refinery', location: 'Bishoftu' } });

    // 2. Warehouses
    const wh1 = await prisma.warehouse.create({ data: { companyId, name: 'Main Raw Material WH', location: 'Addis Ababa', factoryId: factoryA.id } });
    const wh2 = await prisma.warehouse.create({ data: { companyId, name: 'Finished Goods WH', location: 'Addis Ababa', factoryId: factoryA.id } });

    // 3. Outlets
    await prisma.salesOutlet.create({ data: { companyId, name: 'Merkato Distribution Center', location: 'Addis Ababa' } });
    await prisma.salesOutlet.create({ data: { companyId, name: 'Bole Retail Outlet', location: 'Addis Ababa' } });

    // 4. Suppliers
    const supplier1 = await prisma.supplier.create({ data: { companyId, name: 'Global Grain Traders', contact: '+251 911 000000', email: 'info@globalgrain.com' } });

    // 5. Raw Materials
    const wheat = await prisma.rawMaterial.create({ data: { companyId, name: 'Hard Red Wheat', unit: 'bag' } });
    await prisma.rawMaterial.create({ data: { companyId, name: 'White Maize', unit: 'bag' } });

    // 6. Products
    const flour25 = await prisma.product.create({ data: { companyId, name: 'Premium Flour', category: 'Flour', packageSize: '25kg', unit: 'bag', price: 45 } });
    const oil5 = await prisma.product.create({ data: { companyId, name: 'Pure Sunflower Oil', category: 'Oil', packageSize: '5L', unit: 'bottle', price: 12 } });

    // 7. Inventory
    await prisma.inventoryItem.create({ data: { companyId, unitId: wh1.id, itemId: wheat.id, itemType: 'raw', quantity: 5000, batchNumber: 'W-2024-001' } });
    await prisma.inventoryItem.create({ data: { companyId, unitId: wh2.id, itemId: flour25.id, itemType: 'product', quantity: 1200, batchNumber: 'F-2024-050' } });
    await prisma.inventoryItem.create({ data: { companyId, unitId: wh2.id, itemId: oil5.id, itemType: 'product', quantity: 500, batchNumber: 'O-2024-001' } });

    // 8. Purchase Orders
    await prisma.purchaseOrder.create({ data: { companyId, supplierId: supplier1.id, supplierName: supplier1.name, factoryId: factoryA.id, warehouseId: wh1.id, status: 'approved', totalAmount: 25000, createdBy: 'system', items: [] } });

    // 9. Production Runs
    await prisma.productionRun.create({ data: { companyId, factoryId: factoryA.id, productId: flour25.id, quantity: 2000, status: 'in_progress', startDate: new Date() } });

    // 10. Sales Orders
    await prisma.salesOrder.create({ data: { companyId, outletId: 'outlet1', outletName: 'Merkato', status: 'paid', totalAmount: 1500, createdBy: 'system', items: [] } });

    // 11. Employees
    await prisma.employee.create({ data: { companyId, name: 'Abebe Kebede', email: 'abebe@cibus.com', department: 'Production', role: 'Machine Operator', salary: 1200, factoryId: factoryA.id, hireDate: new Date() } });
    await prisma.employee.create({ data: { companyId, name: 'Sara Tadesse', email: 'sara@cibus.com', department: 'Finance', role: 'Accountant', salary: 1800, hireDate: new Date() } });

    console.log(`Seeding complete for company ${companyId}!`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
