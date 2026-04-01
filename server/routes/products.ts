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
