import { Router } from "express";
import { getStorage } from "../services/dbFactory.js";

export const hrRouter = Router();

// Employees
hrRouter.get("/employees", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const storage = getStorage();
    const employees = await storage.find("employees", { companyId });
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

hrRouter.post("/employees", async (req, res) => {
  try {
    const employeeData = req.body;
    const storage = getStorage();
    const result = await storage.create("employees", employeeData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

hrRouter.put("/employees/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;
    const storage = getStorage();
    const result = await storage.update("employees", employeeId, updateData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
