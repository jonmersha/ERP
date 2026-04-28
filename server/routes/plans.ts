import { Router } from "express";
import { db } from "../firebase.js";

export const plansRouter = Router();

// Generic function to get plans by collection name and companyId
const getPlans = async (collectionName: string, req: any, res: any) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const snapshot = await db.collection(collectionName)
      .where("companyId", "==", companyId)
      .get();

    const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const docRef = await db.collection(collectionName).add({
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, ...planData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generic function to update a plan
const updatePlan = async (collectionName: string, req: any, res: any) => {
  try {
    const planId = req.params.id;
    const updateData = req.body;
    await db.collection(collectionName).doc(planId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    res.json({ id: planId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generic function to delete a plan
const deletePlan = async (collectionName: string, req: any, res: any) => {
  try {
    const planId = req.params.id;
    await db.collection(collectionName).doc(planId).delete();
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
