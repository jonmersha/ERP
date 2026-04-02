import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const salesRouter = Router();

// Sales Orders
salesRouter.get("/orders", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const orders = await prisma.salesOrder.findMany({
      where: { companyId }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.post("/orders", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const orderData = req.body;
    const order = await prisma.salesOrder.create({
      data: {
        ...orderData,
        companyId,
        createdAt: orderData.createdAt || new Date().toISOString(),
        status: orderData.status || 'pending'
      }
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.put("/orders/:id", async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    
    const order = await prisma.salesOrder.findUnique({ where: { id: orderId } });
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedOrder = await prisma.salesOrder.update({
      where: { id: orderId },
      data: { ...updateData }
    });
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Outlets
salesRouter.get("/outlets", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const outlets = await prisma.salesOutlet.findMany({
      where: { companyId }
    });
    res.json(outlets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.post("/outlets", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const outletData = req.body;
    const outlet = await prisma.salesOutlet.create({
      data: {
        ...outletData,
        companyId
      }
    });
    res.status(201).json(outlet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
