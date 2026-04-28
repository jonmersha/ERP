import { Router } from "express";
import { db } from "../firebase.js";

export const logisticsRouter = Router();

// Shipments
logisticsRouter.get("/shipments", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("shipments")
      .where("companyId", "==", companyId)
      .get();

    const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(shipments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.post("/shipments", async (req, res) => {
  try {
    const shipmentData = req.body;
    const docRef = await db.collection("shipments").add({
      ...shipmentData,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ id: docRef.id, ...shipmentData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.put("/shipments/:id", async (req, res) => {
  try {
    const shipmentId = req.params.id;
    const updateData = req.body;
    await db.collection("shipments").doc(shipmentId).update(updateData);
    res.json({ id: shipmentId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.delete("/shipments/:id", async (req, res) => {
  try {
    const shipmentId = req.params.id;
    await db.collection("shipments").doc(shipmentId).delete();
    res.json({ id: shipmentId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
