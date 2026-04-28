import { Router } from "express";
import { db } from "../firebase.js";

export const hrRouter = Router();

// Employees
hrRouter.get("/employees", async (req, res) => {
  try {
    const companyId = req.query.companyId as string;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const snapshot = await db.collection("employees")
      .where("companyId", "==", companyId)
      .get();

    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

hrRouter.post("/employees", async (req, res) => {
  try {
    const employeeData = req.body;
    const docRef = await db.collection("employees").add({
      ...employeeData,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ id: docRef.id, ...employeeData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

hrRouter.put("/employees/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;
    await db.collection("employees").doc(employeeId).update(updateData);
    res.json({ id: employeeId, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
