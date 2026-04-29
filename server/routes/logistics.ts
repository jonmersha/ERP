import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const logisticsRouter = Router();

// Shipments
logisticsRouter.get("/shipments", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const shipments = await storage.find("shipments", { companyId });
    res.json(shipments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.post("/shipments", async (req, res) => {
  try {
    const shipmentData = req.body;
    const storage = getStorage();
    const result = await storage.create("shipments", shipmentData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.put("/shipments/:id", async (req, res) => {
  try {
    const shipmentId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("shipments", shipmentId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.delete("/shipments/:id", async (req, res) => {
  try {
    const shipmentId = req.params.id;
    const storage = getStorage();
    await storage.delete("shipments", shipmentId);
    res.json({ id: shipmentId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
