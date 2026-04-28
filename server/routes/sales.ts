import { Router } from "express";
import { db } from "../firebase.js";

export const salesRouter = Router();

// Sales Orders
salesRouter.get("/orders", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("salesOrders")
      .where("companyId", "==", companyId)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.post("/orders", async (req, res) => {
  try {
    const orderData = req.body;
    const docRef = await db.collection("salesOrders").add({
      ...orderData,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending'
    });
    res.status(201).json({ id: docRef.id, ...orderData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.put("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    await db.collection("salesOrders").doc(orderId).update(updateData);
    res.json({ id: orderId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Outlets
salesRouter.get("/outlets", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("salesOutlets")
      .where("companyId", "==", companyId)
      .get();

    const outlets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(outlets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

salesRouter.post("/outlets", async (req, res) => {
  try {
    const outletData = req.body;
    const docRef = await db.collection("salesOutlets").add(outletData);
    res.status(201).json({ id: docRef.id, ...outletData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
