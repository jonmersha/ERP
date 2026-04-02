import { Router } from "express";
import { prisma } from "../db";

export const coreRouter = Router();

// Factories
coreRouter.get("/factories", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const factories = await prisma.factory.findMany({
      where: { companyId }
    });
    res.json(factories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.post("/factories", async (req, res) => {
  try {
    const data = req.body;
    const factory = await prisma.factory.create({ data });
    res.status(201).json(factory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.put("/factories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const factory = await prisma.factory.update({
      where: { id },
      data
    });
    res.json(factory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.delete("/factories/:id", async (req, res) => {
  try {
    await prisma.factory.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Warehouses
coreRouter.get("/warehouses", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const warehouses = await prisma.warehouse.findMany({
      where: { companyId }
    });
    res.json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.post("/warehouses", async (req, res) => {
  try {
    const data = req.body;
    const warehouse = await prisma.warehouse.create({ data });
    res.status(201).json(warehouse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.put("/warehouses/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data
    });
    res.json(warehouse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.delete("/warehouses/:id", async (req, res) => {
  try {
    await prisma.warehouse.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Orders
coreRouter.get("/sales-orders", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const limit = parseInt(req.query.limit as string) || 100;
    const orderByField = req.query.orderBy as string;
    const orderDir = (req.query.orderDir as string || "desc") as "asc" | "desc";

    const orders = await prisma.salesOrder.findMany({
      where: { companyId },
      orderBy: orderByField ? { [orderByField]: orderDir } : undefined,
      take: limit
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
