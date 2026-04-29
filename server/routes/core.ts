import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const coreRouter = Router();

// Factories
coreRouter.get("/factories", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const factories = await storage.find("factories", { companyId });
    res.json(factories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.post("/factories", async (req, res) => {
  try {
    const data = req.body;
    const storage = getStorage();
    const result = await storage.create("factories", data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.put("/factories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const storage = getStorage();
    const result = await storage.update("factories", id, data);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.delete("/factories/:id", async (req, res) => {
  try {
    const storage = getStorage();
    await storage.delete("factories", req.params.id);
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

    const storage = getStorage();
    const warehouses = await storage.find("warehouses", { companyId });
    res.json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.post("/warehouses", async (req, res) => {
  try {
    const data = req.body;
    const storage = getStorage();
    const result = await storage.create("warehouses", data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.put("/warehouses/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const storage = getStorage();
    const result = await storage.update("warehouses", id, data);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.delete("/warehouses/:id", async (req, res) => {
  try {
    const storage = getStorage();
    await storage.delete("warehouses", req.params.id);
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

    const limitCount = parseInt(req.query.limit as string) || 100;
    const orderByField = req.query.orderBy as string;
    const orderDir = (req.query.orderDir as string || "desc") as "asc" | "desc";

    const storage = getStorage();
    const orders = await storage.find("salesOrders", {
      companyId,
      limitCount,
      orderByField,
      orderDir
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
