import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const inventoryRouter = Router();

// Get all inventory items
inventoryRouter.get("/", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const storage = getStorage();
    const inventory = await storage.find("inventory", { companyId });
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory for a specific unit
inventoryRouter.get("/unit/:unitId", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required for filtering" });
    
    const storage = getStorage();
    // We might need a better 'find' that supports multiple filters, but for now we filter by companyId
    // and manually filter by unitId if the find doesn't support it.
    // In SQL mode we can improve find, in Firebase too.
    const allInventory = await storage.find("inventory", { companyId });
    const filtered = allInventory.filter((item: any) => item.unitId === req.params.unitId);
    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory quantity
inventoryRouter.put("/:id", async (req, res) => {
  try {
    const inventoryId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("inventory", inventoryId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Receive Purchase Order
inventoryRouter.post("/receive-po", async (req, res) => {
  try {
    const { selectedPO, warehouseId, notes, profile } = req.body;
    const storage = getStorage();
    const companyId = profile?.companyId || selectedPO.companyId || '';

    // Create GRN
    const grnData = {
      purchaseOrderId: selectedPO.id,
      warehouseId: warehouseId,
      receivedBy: profile?.uid || '',
      receivedAt: new Date().toISOString(),
      items: (selectedPO.items || []).map((item: any) => ({
        itemId: item.itemId,
        quantityReceived: item.quantity
      })),
      notes: notes,
      companyId: companyId
    };
    const createdGrn = await storage.create("grns", grnData);

    const items = selectedPO.items || [];
    for (const item of items) {
      // Find current inventory
      const existingInv = await storage.find("inventory", { companyId });
      const currentItem = existingInv.find((i: any) => 
        i.unitId === warehouseId && i.itemId === item.itemId && i.itemType === "raw"
      );

      if (currentItem) {
        await storage.update("inventory", currentItem.id, {
          quantity: (Number(currentItem.quantity) || 0) + Number(item.quantity)
        });
      } else {
        await storage.create("inventory", {
          unitId: warehouseId,
          itemId: item.itemId,
          itemType: "raw",
          quantity: item.quantity,
          companyId: companyId
        });
      }
    }

    await storage.update("purchaseOrders", selectedPO.id, { status: "received" });
    res.json({ success: true, grnId: createdGrn.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Production to Warehouse
inventoryRouter.post("/transfer-production", async (req, res) => {
  try {
    const { productId, quantity, warehouseId, profile } = req.body;
    const storage = getStorage();
    const companyId = profile?.companyId || '';
    
    // Find current inventory
    const existingInv = await storage.find("inventory", { companyId });
    const currentItem = existingInv.find((i: any) => 
      i.unitId === warehouseId && i.itemId === productId && i.itemType === "product"
    );

    if (currentItem) {
      await storage.update("inventory", currentItem.id, {
        quantity: (Number(currentItem.quantity) || 0) + Number(quantity)
      });
    } else {
      await storage.create("inventory", {
        unitId: warehouseId,
        itemId: productId,
        itemType: "product",
        quantity: quantity,
        companyId: companyId
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ship Sales Order
inventoryRouter.post("/ship-order", async (req, res) => {
  try {
    const { selectedSO, warehouseId, notes, profile } = req.body;
    const storage = getStorage();
    const companyId = profile?.companyId || selectedSO.companyId || '';
    
    const items = selectedSO.items || [];
    const existingInv = await storage.find("inventory", { companyId });

    // Validate quantities first
    for (const item of items) {
      const currentItem = existingInv.find((i: any) => 
        i.unitId === warehouseId && i.itemId === item.productId && i.itemType === "product"
      );

      if (!currentItem || (Number(currentItem.quantity) || 0) < Number(item.quantity)) {
        throw new Error(`Insufficient stock for ${item.productName || item.productId}`);
      }
    }

    // Process updates
    for (const item of items) {
      const currentItem = existingInv.find((i: any) => 
        i.unitId === warehouseId && i.itemId === item.productId && i.itemType === "product"
      )!;

      await storage.update("inventory", currentItem.id, {
        quantity: (Number(currentItem.quantity) || 0) - Number(item.quantity)
      });
    }

    // Create DN
    const dnData = {
      salesOrderId: selectedSO.id,
      warehouseId: warehouseId,
      shippedBy: profile?.uid || '',
      shippedAt: new Date().toISOString(),
      items: items.map((item: any) => ({
        productId: item.productId,
        quantityShipped: item.quantity
      })),
      notes: notes,
      companyId: companyId
    };
    const createdDn = await storage.create("deliveryNotes", dnData);

    await storage.update("salesOrders", selectedSO.id, { status: "shipped" });
    res.json({ success: true, dnId: createdDn.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all GRNs
inventoryRouter.get("/grns", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const grns = await storage.find("grns", { 
      companyId,
      orderByField: "receivedAt",
      orderDir: "desc"
    });
    res.json(grns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Delivery Notes
inventoryRouter.get("/delivery-notes", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const dns = await storage.find("deliveryNotes", { 
      companyId,
      orderByField: "shippedAt",
      orderDir: "desc"
    });
    res.json(dns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
