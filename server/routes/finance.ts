import { Router } from "express";
import { db } from "../firebase.js";

export const financeRouter = Router();

// Invoices
financeRouter.get("/invoices", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("invoices")
      .where("companyId", "==", companyId)
      .get();

    const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.post("/invoices", async (req, res) => {
  try {
    const invoiceData = req.body;
    const docRef = await db.collection("invoices").add({
      ...invoiceData,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, ...invoiceData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.put("/invoices/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const updateData = req.body;
    await db.collection("invoices").doc(invoiceId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    res.json({ id: invoiceId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments
financeRouter.get("/payments", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("payments")
      .where("companyId", "==", companyId)
      .get();

    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.post("/payments", async (req, res) => {
  try {
    const paymentData = req.body;
    const docRef = await db.collection("payments").add({
      ...paymentData,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, ...paymentData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
