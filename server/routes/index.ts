import { Router } from "express";
import { productionRouter } from "./production.js";
import { productRouter } from "./products.js";
import { inventoryRouter } from "./inventory.js";
import { plansRouter } from "./plans.js";
import { financeRouter } from "./finance.js";
import { coreRouter } from "./core.js";
import { procurementRouter } from "./procurement.js";
import { salesRouter } from "./sales.js";
import { hrRouter } from "./hr.js";
import { logisticsRouter } from "./logistics.js";
import { maintenanceRouter } from "./maintenance.js";
import usersRouter from "./users.js";

export const apiRouter = Router();

apiRouter.use("/production", productionRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/plans", plansRouter);
apiRouter.use("/finance", financeRouter);
apiRouter.use("/core", coreRouter);
apiRouter.use("/procurement", procurementRouter);
apiRouter.use("/sales", salesRouter);
apiRouter.use("/hr", hrRouter);
apiRouter.use("/logistics", logisticsRouter);
apiRouter.use("/maintenance", maintenanceRouter);
apiRouter.use("/users", usersRouter);

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
