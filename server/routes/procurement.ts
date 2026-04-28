import { Router } from "express";
import { db } from "../firebase.js";

export const procurementRouter = Router();

// Purchase Orders
procurementRouter.get("/purchase-orders", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("purchaseOrders")
      .where("companyId", "==", companyId)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.post("/purchase-orders", async (req, res) => {
  try {
    const orderData = req.body;
    const docRef = await db.collection("purchaseOrders").add({
      ...orderData,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending'
    });
    res.status(201).json({ id: docRef.id, ...orderData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.put("/purchase-orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    await db.collection("purchaseOrders").doc(orderId).update(updateData);
    res.json({ id: orderId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers
procurementRouter.get("/suppliers", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("suppliers")
      .where("companyId", "==", companyId)
      .get();

    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

procurementRouter.post("/suppliers", async (req, res) => {
  try {
    const supplierData = req.body;
    const docRef = await db.collection("suppliers").add(supplierData);
    res.status(201).json({ id: docRef.id, ...supplierData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
