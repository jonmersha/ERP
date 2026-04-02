import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const plansRouter = Router();

// Helper to get the correct prisma delegate
const getPrismaDelegate = (collectionName: string) => {
  switch (collectionName) {
    case "productionPlans": return prisma.productionPlan;
    case "procurementPlans": return prisma.procurementPlan;
    case "salesPlans": return prisma.salesPlan;
    case "financialPlans": return prisma.financialPlan;
    default: throw new Error("Invalid collection name");
  }
};

// Generic function to get plans by collection name and companyId
const getPlans = async (collectionName: string, req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "User companyId not found" });
    }

    const delegate = getPrismaDelegate(collectionName);
    const plans = await (delegate as any).findMany({
      where: { companyId }
    });
    res.json(plans);
  } catch (error: any) {
    console.error(`Error fetching ${collectionName}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Generic function to add a plan
const addPlan = async (collectionName: string, req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const planData = req.body;
    const delegate = getPrismaDelegate(collectionName);
    const plan = await (delegate as any).create({
      data: {
        ...planData,
        companyId
      }
    });
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generic function to update a plan
const updatePlan = async (collectionName: string, req: AuthRequest, res: Response) => {
  try {
    const planId = req.params.id;
    const updateData = req.body;
    
    const delegate = getPrismaDelegate(collectionName);
    const plan = await (delegate as any).findUnique({ where: { id: planId } });
    
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    if (plan.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedPlan = await (delegate as any).update({
      where: { id: planId },
      data: { ...updateData }
    });
    res.json(updatedPlan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Generic function to delete a plan
const deletePlan = async (collectionName: string, req: AuthRequest, res: Response) => {
  try {
    const planId = req.params.id;
    
    const delegate = getPrismaDelegate(collectionName);
    const plan = await (delegate as any).findUnique({ where: { id: planId } });
    
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    if (plan.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await (delegate as any).delete({ where: { id: planId } });
    res.json({ id: planId, deleted: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Production Plans
plansRouter.get("/production", (req: AuthRequest, res: Response) => getPlans("productionPlans", req, res));
plansRouter.post("/production", (req: AuthRequest, res: Response) => addPlan("productionPlans", req, res));
plansRouter.put("/production/:id", (req: AuthRequest, res: Response) => updatePlan("productionPlans", req, res));
plansRouter.delete("/production/:id", (req: AuthRequest, res: Response) => deletePlan("productionPlans", req, res));

// Procurement Plans
plansRouter.get("/procurement", (req: AuthRequest, res: Response) => getPlans("procurementPlans", req, res));
plansRouter.post("/procurement", (req: AuthRequest, res: Response) => addPlan("procurementPlans", req, res));
plansRouter.put("/procurement/:id", (req: AuthRequest, res: Response) => updatePlan("procurementPlans", req, res));
plansRouter.delete("/procurement/:id", (req: AuthRequest, res: Response) => deletePlan("procurementPlans", req, res));

// Sales Plans
plansRouter.get("/sales", (req: AuthRequest, res: Response) => getPlans("salesPlans", req, res));
plansRouter.post("/sales", (req: AuthRequest, res: Response) => addPlan("salesPlans", req, res));
plansRouter.put("/sales/:id", (req: AuthRequest, res: Response) => updatePlan("salesPlans", req, res));
plansRouter.delete("/sales/:id", (req: AuthRequest, res: Response) => deletePlan("salesPlans", req, res));

// Financial Plans
plansRouter.get("/financial", (req: AuthRequest, res: Response) => getPlans("financialPlans", req, res));
plansRouter.post("/financial", (req: AuthRequest, res: Response) => addPlan("financialPlans", req, res));
plansRouter.put("/financial/:id", (req: AuthRequest, res: Response) => updatePlan("financialPlans", req, res));
plansRouter.delete("/financial/:id", (req: AuthRequest, res: Response) => deletePlan("financialPlans", req, res));
