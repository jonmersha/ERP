import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const procurementRouter = Router();

// Purchase Orders
procurementRouter.get("/purchase-orders", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const orders = await storage.find("purchaseOrders", { companyId });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.post("/purchase-orders", async (req, res) => {
  try {
    const orderData = req.body;
    const storage = getStorage();
    const result = await storage.create("purchaseOrders", {
      ...orderData,
      status: orderData.status || 'pending'
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.put("/purchase-orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("purchaseOrders", orderId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers
procurementRouter.get("/suppliers", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const suppliers = await storage.find("suppliers", { companyId });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.post("/suppliers", async (req, res) => {
  try {
    const supplierData = req.body;
    const storage = getStorage();
    const result = await storage.create("suppliers", supplierData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
