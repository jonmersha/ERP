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
