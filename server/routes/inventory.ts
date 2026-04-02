import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const inventoryRouter = Router();

// Get all inventory items
inventoryRouter.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "User companyId not found" });
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: { companyId }
    });
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory for a specific unit
inventoryRouter.get("/unit/:unitId", async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: { 
        unitId: req.params.unitId,
        companyId: req.user?.companyId
      }
    });
    
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory quantity
inventoryRouter.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const inventoryId = req.params.id;
    const updateData = req.body;
    
    const item = await prisma.inventoryItem.findUnique({ where: { id: inventoryId } });
    
    if (!item) return res.status(404).json({ error: "Inventory item not found" });
    if (item.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryId },
      data: { ...updateData }
    });
    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Receive Purchase Order
inventoryRouter.post("/receive-po", async (req: AuthRequest, res: Response) => {
  try {
    const { selectedPO, warehouseId, notes } = req.body;
    const companyId = req.user?.companyId;
    const uid = req.user?.uid;
    
    if (!companyId || !uid) return res.status(400).json({ error: "User info missing" });

    const result = await prisma.$transaction(async (tx) => {
      const grn = await tx.gRN.create({
        data: {
          purchaseOrderId: selectedPO.id,
          warehouseId: warehouseId,
          receivedBy: uid,
          receivedAt: new Date(),
          items: (selectedPO.items || []).map((item: any) => ({
            itemId: item.itemId,
            quantityReceived: item.quantity
          })),
          notes: notes,
          companyId: companyId
        }
      });

      const items = selectedPO.items || [];
      for (const item of items) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            companyId,
            unitId: warehouseId,
            itemId: item.itemId,
            itemType: "raw"
          }
        });

        if (inventoryItem) {
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity + item.quantity }
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              unitId: warehouseId,
              itemId: item.itemId,
              itemType: "raw",
              quantity: item.quantity,
              companyId: companyId
            }
          });
        }
      }

      await tx.purchaseOrder.update({
        where: { id: selectedPO.id },
        data: { status: "received" }
      });
      
      return grn;
    });

    res.json({ success: true, grnId: result.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Production to Warehouse
inventoryRouter.post("/transfer-production", async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, warehouseId } = req.body;
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    await prisma.$transaction(async (tx) => {
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          companyId,
          unitId: warehouseId,
          itemId: productId,
          itemType: "product"
        }
      });

      if (inventoryItem) {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: inventoryItem.quantity + quantity }
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            unitId: warehouseId,
            itemId: productId,
            itemType: "product",
            quantity: quantity,
            companyId: companyId
          }
        });
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ship Sales Order
inventoryRouter.post("/ship-order", async (req: AuthRequest, res: Response) => {
  try {
    const { selectedSO, warehouseId, notes } = req.body;
    const companyId = req.user?.companyId;
    const uid = req.user?.uid;
    
    if (!companyId || !uid) return res.status(400).json({ error: "User info missing" });

    const result = await prisma.$transaction(async (tx) => {
      const dn = await tx.deliveryNote.create({
        data: {
          salesOrderId: selectedSO.id,
          warehouseId: warehouseId,
          shippedBy: uid,
          shippedAt: new Date(),
          items: (selectedSO.items || []).map((item: any) => ({
            productId: item.productId,
            quantityShipped: item.quantity
          })),
          notes: notes,
          companyId: companyId
        }
      });

      const items = selectedSO.items || [];
      for (const item of items) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            companyId,
            unitId: warehouseId,
            itemId: item.productId,
            itemType: "product"
          }
        });

        if (inventoryItem) {
          if (inventoryItem.quantity < item.quantity) {
             throw new Error(`Insufficient stock for ${item.productName}`);
          }
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity - item.quantity }
          });
        } else {
          throw new Error(`No stock found for ${item.productName} in the selected warehouse.`);
        }
      }

      await tx.salesOrder.update({
        where: { id: selectedSO.id },
        data: { status: "shipped" }
      });
      
      return dn;
    });

    res.json({ success: true, dnId: result.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all GRNs
inventoryRouter.get("/grns", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const grns = await prisma.gRN.findMany({
      where: { companyId },
      orderBy: { receivedAt: 'desc' }
    });
    res.json(grns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Delivery Notes
inventoryRouter.get("/delivery-notes", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const dns = await prisma.deliveryNote.findMany({
      where: { companyId },
      orderBy: { shippedAt: 'desc' }
    });
    res.json(dns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
