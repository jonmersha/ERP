import { Router, Response } from "express";
import { db } from "../firebase.js";
import { AuthRequest } from "../middleware/auth.js";

export const maintenanceRouter = Router();

// Maintenance Logs
maintenanceRouter.get("/logs", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const logs = await prisma.maintenanceLog.findMany({
      where: { companyId }
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.post("/logs", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const logData = req.body;
    const log = await prisma.maintenanceLog.create({
      data: {
        ...logData,
        companyId
      }
    });
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.put("/logs/:id", async (req: AuthRequest, res: Response) => {
  try {
    const logId = req.params.id;
    const updateData = req.body;
    
    const log = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
    
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (log.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedLog = await prisma.maintenanceLog.update({
      where: { id: logId },
      data: { ...updateData }
    });
    res.json(updatedLog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

maintenanceRouter.delete("/logs/:id", async (req: AuthRequest, res: Response) => {
  try {
    const logId = req.params.id;
    
    const log = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
    
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (log.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.maintenanceLog.delete({ where: { id: logId } });
    res.json({ id: logId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
