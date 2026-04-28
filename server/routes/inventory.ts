import { Router } from "express";
import { db } from "../firebase.js";

export const inventoryRouter = Router();

// Get all inventory items
inventoryRouter.get("/", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const snapshot = await db.collection("inventory")
      .where("companyId", "==", companyId)
      .get();

    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory for a specific unit
inventoryRouter.get("/unit/:unitId", async (req, res) => {
  try {
    const snapshot = await db.collection("inventory")
      .where("unitId", "==", req.params.unitId)
      .get();

    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory quantity
inventoryRouter.put("/:id", async (req, res) => {
  try {
    const inventoryId = req.params.id;
    const updateData = req.body;
    await db.collection("inventory").doc(inventoryId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    res.json({ id: inventoryId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Receive Purchase Order
inventoryRouter.post("/receive-po", async (req, res) => {
  try {
    const { selectedPO, warehouseId, notes, profile } = req.body;
    const batch = db.batch();
    const grnRef = db.collection("grns").doc();
    
    const grnData = {
      id: grnRef.id,
      purchaseOrderId: selectedPO.id,
      warehouseId: warehouseId,
      receivedBy: profile?.uid || '',
      receivedAt: new Date().toISOString(),
      items: (selectedPO.items || []).map((item: any) => ({
        itemId: item.itemId,
        quantityReceived: item.quantity
      })),
      notes: notes,
      companyId: profile?.companyId || ''
    };
    batch.set(grnRef, grnData);

    const items = selectedPO.items || [];
    for (const item of items) {
      const inventorySnap = await db.collection("inventory")
        .where("companyId", "==", profile?.companyId)
        .where("unitId", "==", warehouseId)
        .where("itemId", "==", item.itemId)
        .where("itemType", "==", "raw")
        .get();

      if (!inventorySnap.empty) {
        const invDoc = inventorySnap.docs[0];
        batch.update(invDoc.ref, {
          quantity: invDoc.data().quantity + item.quantity
        });
      } else {
        const newInvRef = db.collection("inventory").doc();
        batch.set(newInvRef, {
          unitId: warehouseId,
          itemId: item.itemId,
          itemType: "raw",
          quantity: item.quantity,
          createdAt: new Date().toISOString(),
          companyId: profile?.companyId || ''
        });
      }
    }

    batch.update(db.collection("purchaseOrders").doc(selectedPO.id), { status: "received" });
    await batch.commit();
    res.json({ success: true, grnId: grnRef.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Production to Warehouse
inventoryRouter.post("/transfer-production", async (req, res) => {
  try {
    const { productId, quantity, warehouseId, profile } = req.body;
    const batch = db.batch();
    
    const inventorySnap = await db.collection("inventory")
      .where("companyId", "==", profile?.companyId)
      .where("unitId", "==", warehouseId)
      .where("itemId", "==", productId)
      .where("itemType", "==", "product")
      .get();

    if (!inventorySnap.empty) {
      const invDoc = inventorySnap.docs[0];
      batch.update(invDoc.ref, {
        quantity: invDoc.data().quantity + quantity
      });
    } else {
      const newInvRef = db.collection("inventory").doc();
      batch.set(newInvRef, {
        unitId: warehouseId,
        itemId: productId,
        itemType: "product",
        quantity: quantity,
        createdAt: new Date().toISOString(),
        companyId: profile?.companyId || ''
      });
    }

    await batch.commit();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ship Sales Order
inventoryRouter.post("/ship-order", async (req, res) => {
  try {
    const { selectedSO, warehouseId, notes, profile } = req.body;
    const batch = db.batch();
    const dnRef = db.collection("deliveryNotes").doc();
    
    const dnData = {
      id: dnRef.id,
      salesOrderId: selectedSO.id,
      warehouseId: warehouseId,
      shippedBy: profile?.uid || '',
      shippedAt: new Date().toISOString(),
      items: (selectedSO.items || []).map((item: any) => ({
        productId: item.productId,
        quantityShipped: item.quantity
      })),
      notes: notes,
      companyId: profile?.companyId || ''
    };
    batch.set(dnRef, dnData);

    const items = selectedSO.items || [];
    for (const item of items) {
      const inventorySnap = await db.collection("inventory")
        .where("companyId", "==", profile?.companyId)
        .where("unitId", "==", warehouseId)
        .where("itemId", "==", item.productId)
        .where("itemType", "==", "product")
        .get();

      if (!inventorySnap.empty) {
        const invDoc = inventorySnap.docs[0];
        const currentQty = invDoc.data().quantity;
        if (currentQty < item.quantity) {
           throw new Error(`Insufficient stock for ${item.productName}`);
        }
        batch.update(invDoc.ref, {
          quantity: currentQty - item.quantity
        });
      } else {
        throw new Error(`No stock found for ${item.productName} in the selected warehouse.`);
      }
    }

    batch.update(db.collection("salesOrders").doc(selectedSO.id), { status: "shipped" });
    await batch.commit();
    res.json({ success: true, dnId: dnRef.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all GRNs
inventoryRouter.get("/grns", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("grns")
      .where("companyId", "==", companyId)
      .orderBy("receivedAt", "desc")
      .get();

    const grns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    const snapshot = await db.collection("deliveryNotes")
      .where("companyId", "==", companyId)
      .orderBy("shippedAt", "desc")
      .get();

    const dns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(dns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
