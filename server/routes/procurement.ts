import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const procurementRouter = Router();

// Purchase Orders
procurementRouter.get("/orders", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const orders = await prisma.purchaseOrder.findMany({
      where: { companyId }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.post("/orders", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const orderData = req.body;
    const order = await prisma.purchaseOrder.create({
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

procurementRouter.put("/orders/:id", async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    
    const order = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: { ...updateData }
    });
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers
procurementRouter.get("/suppliers", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const suppliers = await prisma.supplier.findMany({
      where: { companyId }
    });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.post("/suppliers", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const supplierData = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        ...supplierData,
        companyId
      }
    });
    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
