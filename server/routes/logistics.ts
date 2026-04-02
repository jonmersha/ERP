import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const logisticsRouter = Router();

// Shipments
logisticsRouter.get("/shipments", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const shipments = await prisma.shipment.findMany({
      where: { companyId }
    });
    res.json(shipments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.post("/shipments", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const shipmentData = req.body;
    const shipment = await prisma.shipment.create({
      data: {
        ...shipmentData,
        companyId
      }
    });
    res.status(201).json(shipment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.put("/shipments/:id", async (req: AuthRequest, res: Response) => {
  try {
    const shipmentId = req.params.id;
    const updateData = req.body;
    
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    if (shipment.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { ...updateData }
    });
    res.json(updatedShipment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

logisticsRouter.delete("/shipments/:id", async (req: AuthRequest, res: Response) => {
  try {
    const shipmentId = req.params.id;
    
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    if (shipment.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.shipment.delete({ where: { id: shipmentId } });
    res.json({ id: shipmentId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
