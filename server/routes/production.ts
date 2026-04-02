import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const productionRouter = Router();

// Get all production runs
productionRouter.get("/runs", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "User companyId not found" });
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const orderByField = req.query.orderBy as string;
    const orderDir = (req.query.orderDir as string || "desc") as "asc" | "desc";

    const runs = await prisma.productionRun.findMany({
      where: { companyId },
      orderBy: orderByField ? { [orderByField]: orderDir } : undefined,
      take: limit
    });
    res.json(runs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single production run
productionRouter.get("/runs/:id", async (req: AuthRequest, res: Response) => {
  try {
    const run = await prisma.productionRun.findUnique({ where: { id: req.params.id } });
    if (!run) {
      return res.status(404).json({ error: "Production run not found" });
    }
    
    if (run.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden: Access to this record is denied" });
    }

    res.json(run);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a production run
productionRouter.post("/runs", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const runData = req.body;
    const run = await prisma.productionRun.create({
      data: {
        ...runData,
        companyId
      }
    });
    res.status(201).json(run);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a production run
productionRouter.put("/runs/:id", async (req: AuthRequest, res: Response) => {
  try {
    const runId = req.params.id;
    const updateData = req.body;
    
    const run = await prisma.productionRun.findUnique({ where: { id: runId } });
    
    if (!run) {
      return res.status(404).json({ error: "Production run not found" });
    }
    
    if (run.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden: Access to this record is denied" });
    }

    const updatedRun = await prisma.productionRun.update({
      where: { id: runId },
      data: { ...updateData }
    });
    res.json(updatedRun);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recipes
productionRouter.get("/recipes", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const recipes = await prisma.recipe.findMany({
      where: { companyId }
    });
    res.json(recipes);
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

productionRouter.post("/recipes", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const recipeData = req.body;
    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        companyId
      }
    });
    res.status(201).json(recipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productionRouter.put("/recipes/:id", async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = req.params.id;
    const updateData = req.body;
    
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    if (recipe.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: { ...updateData }
    });
    res.json(updatedRecipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

productionRouter.delete("/recipes/:id", async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = req.params.id;
    
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    if (recipe.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.recipe.delete({ where: { id: recipeId } });
    res.json({ id: recipeId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
