import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const hrRouter = Router();

// Employees
hrRouter.get("/employees", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const employees = await prisma.employee.findMany({
      where: { companyId }
    });
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

hrRouter.post("/employees", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const employeeData = req.body;
    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        companyId
      }
    });
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

hrRouter.put("/employees/:id", async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;
    
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    if (employee.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { ...updateData }
    });
    res.json(updatedEmployee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
