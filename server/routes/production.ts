import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const productionRouter = Router();

// Get all production runs
productionRouter.get("/runs", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const limitCount = parseInt(req.query.limit as string) || 100;
    const orderByField = req.query.orderBy as string;
    const orderDir = (req.query.orderDir as string || "desc") as "asc" | "desc";

    const storage = getStorage();
    const runs = await storage.find("productionRuns", {
      companyId,
      limitCount,
      orderByField,
      orderDir
    });

    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single production run
productionRouter.get("/runs/:id", async (req, res) => {
  try {
    const storage = getStorage();
    const run = await storage.findOne("productionRuns", req.params.id);
    if (!run) {
      return res.status(404).json({ error: "Production run not found" });
    }
    res.json(run);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a production run
productionRouter.post("/runs", async (req, res) => {
  try {
    const runData = req.body;
    const storage = getStorage();
    const result = await storage.create("productionRuns", runData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a production run
productionRouter.put("/runs/:id", async (req, res) => {
  try {
    const runId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("productionRuns", runId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recipes
productionRouter.get("/recipes", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const recipes = await storage.find("recipes", { companyId });
    res.json(recipes);
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

productionRouter.post("/recipes", async (req, res) => {
  try {
    const recipeData = req.body;
    const storage = getStorage();
    const result = await storage.create("recipes", recipeData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productionRouter.put("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("recipes", recipeId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productionRouter.delete("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const storage = getStorage();
    await storage.delete("recipes", recipeId);
    res.json({ id: recipeId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
