import { Router } from "express";
import { db } from "../firebase.js";

export const productRouter = Router();

// Get all products
productRouter.get("/", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const snapshot = await db.collection("products")
      .where("companyId", "==", companyId)
      .get();

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product
productRouter.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("products").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a product
productRouter.post("/", async (req, res) => {
  try {
    const productData = req.body;
    const docRef = await db.collection("products").add({
      ...productData,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, ...productData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection("products").doc(id).update(data);
    res.json({ id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/:id", async (req, res) => {
  try {
    await db.collection("products").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all raw materials
productRouter.get("/raw-materials", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const snapshot = await db.collection("rawMaterials")
      .where("companyId", "==", companyId)
      .get();

    const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/raw-materials", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("rawMaterials").add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/raw-materials/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection("rawMaterials").doc(id).update(data);
    res.json({ id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/raw-materials/:id", async (req, res) => {
  try {
    await db.collection("rawMaterials").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Categories
productRouter.get("/categories", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("categories")
      .where("companyId", "==", companyId)
      .get();

    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/categories", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("categories").add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection("categories").doc(id).update(data);
    res.json({ id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/categories/:id", async (req, res) => {
  try {
    await db.collection("categories").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
