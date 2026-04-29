import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const maintenanceRouter = Router();

// Maintenance Logs
maintenanceRouter.get("/logs", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const logs = await storage.find("maintenance_logs", { companyId });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.post("/logs", async (req, res) => {
  try {
    const logData = req.body;
    const storage = getStorage();
    const result = await storage.create("maintenance_logs", logData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.put("/logs/:id", async (req, res) => {
  try {
    const logId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("maintenance_logs", logId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.delete("/logs/:id", async (req, res) => {
  try {
    const logId = req.params.id;
    const storage = getStorage();
    await storage.delete("maintenance_logs", logId);
    res.json({ id: logId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
