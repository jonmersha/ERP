import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const plansRouter = Router();

// Generic function to get plans by collection name and companyId
const getPlans = async (collectionName: string, req: any, res: any) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const storage = getStorage();
    const plans = await storage.find(collectionName, { companyId });
    res.json(plans);
  } catch (error: any) {
    console.error(`Error fetching ${collectionName}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Generic function to add a plan
const addPlan = async (collectionName: string, req: any, res: any) => {
  try {
    const planData = req.body;
    const storage = getStorage();
    const result = await storage.create(collectionName, planData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generic function to update a plan
const updatePlan = async (collectionName: string, req: any, res: any) => {
  try {
    const planId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update(collectionName, planId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generic function to delete a plan
const deletePlan = async (collectionName: string, req: any, res: any) => {
  try {
    const planId = req.params.id;
    const storage = getStorage();
    await storage.delete(collectionName, planId);
    res.json({ id: planId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Production Plans
plansRouter.get("/production", (req, res) => getPlans("productionPlans", req, res));
plansRouter.post("/production", (req, res) => addPlan("productionPlans", req, res));
plansRouter.put("/production/:id", (req, res) => updatePlan("productionPlans", req, res));
plansRouter.delete("/production/:id", (req, res) => deletePlan("productionPlans", req, res));

// Procurement Plans
plansRouter.get("/procurement", (req, res) => getPlans("procurementPlans", req, res));
plansRouter.post("/procurement", (req, res) => addPlan("procurementPlans", req, res));
plansRouter.put("/procurement/:id", (req, res) => updatePlan("procurementPlans", req, res));
plansRouter.delete("/procurement/:id", (req, res) => deletePlan("procurementPlans", req, res));

// Sales Plans
plansRouter.get("/sales", (req, res) => getPlans("salesPlans", req, res));
plansRouter.post("/sales", (req, res) => addPlan("salesPlans", req, res));
plansRouter.put("/sales/:id", (req, res) => updatePlan("salesPlans", req, res));
plansRouter.delete("/sales/:id", (req, res) => deletePlan("salesPlans", req, res));

// Financial Plans
plansRouter.get("/financial", (req, res) => getPlans("financialPlans", req, res));
plansRouter.post("/financial", (req, res) => addPlan("financialPlans", req, res));
plansRouter.put("/financial/:id", (req, res) => updatePlan("financialPlans", req, res));
plansRouter.delete("/financial/:id", (req, res) => deletePlan("financialPlans", req, res));
