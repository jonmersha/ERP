import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const salesRouter = Router();

// Sales Orders
salesRouter.get("/orders", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const orders = await storage.find("salesOrders", { companyId });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.post("/orders", async (req, res) => {
  try {
    const orderData = req.body;
    const storage = getStorage();
    const result = await storage.create("salesOrders", {
      ...orderData,
      status: orderData.status || 'pending'
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.put("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("salesOrders", orderId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Outlets
salesRouter.get("/outlets", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const outlets = await storage.find("outlets", { companyId });
    res.json(outlets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.post("/outlets", async (req, res) => {
  try {
    const outletData = req.body;
    const storage = getStorage();
    const result = await storage.create("outlets", outletData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
