import { Router } from "express";
import { db } from "../firebase.js";

export const coreRouter = Router();

// Factories
coreRouter.get("/factories", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("factories")
      .where("companyId", "==", companyId)
      .get();

    const factories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(factories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.post("/factories", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("factories").add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.put("/factories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection("factories").doc(id).update(data);
    res.json({ id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.delete("/factories/:id", async (req, res) => {
  try {
    await db.collection("factories").doc(req.params.id).delete();
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

    const snapshot = await db.collection("warehouses")
      .where("companyId", "==", companyId)
      .get();

    const warehouses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.post("/warehouses", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("warehouses").add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.put("/warehouses/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection("warehouses").doc(id).update(data);
    res.json({ id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coreRouter.delete("/warehouses/:id", async (req, res) => {
  try {
    await db.collection("warehouses").doc(req.params.id).delete();
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

    let query = db.collection("salesOrders")
      .where("companyId", "==", companyId);

    if (orderByField) {
      query = query.orderBy(orderByField, orderDir);
    }

    const snapshot = await query.limit(limit).get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
