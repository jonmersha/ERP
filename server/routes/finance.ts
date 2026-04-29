import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const financeRouter = Router();

// Invoices
financeRouter.get("/invoices", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const invoices = await storage.find("invoices", { companyId });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.post("/invoices", async (req, res) => {
  try {
    const invoiceData = req.body;
    const storage = getStorage();
    const result = await storage.create("invoices", invoiceData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.put("/invoices/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("invoices", invoiceId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments
financeRouter.get("/payments", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const payments = await storage.find("payments", { companyId });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.post("/payments", async (req, res) => {
  try {
    const paymentData = req.body;
    const storage = getStorage();
    const result = await storage.create("payments", paymentData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
