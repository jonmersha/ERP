import { Router, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.js";

export const financeRouter = Router();

// Invoices
financeRouter.get("/invoices", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const invoices = await prisma.invoice.findMany({
      where: { companyId }
    });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.post("/invoices", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const invoiceData = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        companyId
      }
    });
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.put("/invoices/:id", async (req: AuthRequest, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const updateData = req.body;
    
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    if (invoice.companyId !== req.user?.companyId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { ...updateData }
    });
    res.json(updatedInvoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments
financeRouter.get("/payments", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const payments = await prisma.payment.findMany({
      where: { companyId }
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

financeRouter.post("/payments", async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: "User companyId not found" });

    const paymentData = req.body;
    const payment = await prisma.payment.create({
      data: {
        ...paymentData,
        companyId
      }
    });
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
