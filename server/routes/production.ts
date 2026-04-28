import { Router } from "express";
import { db } from "../firebase.js";

export const productionRouter = Router();

// Get all production runs
productionRouter.get("/runs", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const orderByField = req.query.orderBy as string;
    const orderDir = (req.query.orderDir as string || "desc") as "asc" | "desc";

    let query = db.collection("productionRuns")
      .where("companyId", "==", companyId);

    if (orderByField) {
      query = query.orderBy(orderByField, orderDir);
    }

    const snapshot = await query.limit(limit).get();

    const runs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single production run
productionRouter.get("/runs/:id", async (req, res) => {
  try {
    const doc = await db.collection("productionRuns").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Production run not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a production run
productionRouter.post("/runs", async (req, res) => {
  try {
    const runData = req.body;
    const docRef = await db.collection("productionRuns").add({
      ...runData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, ...runData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a production run
productionRouter.put("/runs/:id", async (req, res) => {
  try {
    const runId = req.params.id;
    const updateData = req.body;
    await db.collection("productionRuns").doc(runId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    res.json({ id: runId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recipes
productionRouter.get("/recipes", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("recipes")
      .where("companyId", "==", companyId)
      .get();

    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(recipes);
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

productionRouter.post("/recipes", async (req, res) => {
  try {
    const recipeData = req.body;
    const docRef = await db.collection("recipes").add({
      ...recipeData,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, ...recipeData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productionRouter.put("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const updateData = req.body;
    await db.collection("recipes").doc(recipeId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    res.json({ id: recipeId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productionRouter.delete("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    await db.collection("recipes").doc(recipeId).delete();
    res.json({ id: recipeId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
