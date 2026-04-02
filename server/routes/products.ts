import { Router } from "express";
import { prisma } from "../db";

export const productRouter = Router();

// Get all products
productRouter.get("/", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const products = await prisma.product.findMany({
      where: { companyId }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a product
productRouter.post("/", async (req, res) => {
  try {
    const productData = req.body;
    const product = await prisma.product.create({
      data: {
        ...productData,
      }
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { ...data }
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
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

    const materials = await prisma.rawMaterial.findMany({
      where: { companyId }
    });
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/raw-materials", async (req, res) => {
  try {
    const data = req.body;
    const material = await prisma.rawMaterial.create({
      data: { ...data }
    });
    res.status(201).json(material);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/raw-materials/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const material = await prisma.rawMaterial.update({
      where: { id },
      data: { ...data }
    });
    res.json(material);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/raw-materials/:id", async (req, res) => {
  try {
    await prisma.rawMaterial.delete({ where: { id: req.params.id } });
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

    const categories = await prisma.category.findMany({
      where: { companyId }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/categories", async (req, res) => {
  try {
    const data = req.body;
    const category = await prisma.category.create({
      data: { ...data }
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.put("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { ...data }
    });
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete("/categories/:id", async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
