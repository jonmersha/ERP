import { Router } from "express";
import { db } from "../firebase.js";

export const maintenanceRouter = Router();

// Maintenance Logs
maintenanceRouter.get("/logs", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("maintenance_logs")
      .where("companyId", "==", companyId)
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.post("/logs", async (req, res) => {
  try {
    const logData = req.body;
    const docRef = await db.collection("maintenance_logs").add({
      ...logData,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ id: docRef.id, ...logData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.put("/logs/:id", async (req, res) => {
  try {
    const logId = req.params.id;
    const updateData = req.body;
    await db.collection("maintenance_logs").doc(logId).update(updateData);
    res.json({ id: logId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.delete("/logs/:id", async (req, res) => {
  try {
    const logId = req.params.id;
    await db.collection("maintenance_logs").doc(logId).delete();
    res.json({ id: logId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
