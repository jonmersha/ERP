import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const productRouter = Router();

// Get all products
productRouter.get("/", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const storage = getStorage();
    const products = await storage.find("products", { companyId });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product
productRouter.get("/:id", async (req, res) => {
  try {
    const storage = getStorage();
    const result = await storage.findOne("products", req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a product
productRouter.post("/", async (req, res) => {
  try {
    const productData = req.body;
    const storage = getStorage();
    const result = await storage.create("products", productData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const storage = getStorage();
    const result = await storage.update("products", id, data);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/:id", async (req, res) => {
  try {
    const storage = getStorage();
    await storage.delete("products", req.params.id);
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

    const storage = getStorage();
    const materials = await storage.find("rawMaterials", { companyId });
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/raw-materials", async (req, res) => {
  try {
    const data = req.body;
    const storage = getStorage();
    const result = await storage.create("rawMaterials", data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/raw-materials/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const storage = getStorage();
    const result = await storage.update("rawMaterials", id, data);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/raw-materials/:id", async (req, res) => {
  try {
    const storage = getStorage();
    await storage.delete("rawMaterials", req.params.id);
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

    const storage = getStorage();
    const categories = await storage.find("categories", { companyId });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/categories", async (req, res) => {
  try {
    const data = req.body;
    const storage = getStorage();
    const result = await storage.create("categories", data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const storage = getStorage();
    const result = await storage.update("categories", id, data);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/categories/:id", async (req, res) => {
  try {
    const storage = getStorage();
    await storage.delete("categories", req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
