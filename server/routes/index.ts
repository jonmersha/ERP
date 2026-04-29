import { Router } from "express";
import { productionRouter } from "./production";
import { productRouter } from "./products";
import { inventoryRouter } from "./inventory";
import { plansRouter } from "./plans";
import { financeRouter } from "./finance";
import { coreRouter } from "./core";
import { procurementRouter } from "./procurement";
import { salesRouter } from "./sales";
import { hrRouter } from "./hr";
import { logisticsRouter } from "./logistics";
import { maintenanceRouter } from "./maintenance";
import usersRouter from "./users";
import { dataRouter } from "./data";
import { settingsRouter } from "./settings";

export const apiRouter = Router();

apiRouter.use("/data", dataRouter);
apiRouter.use("/settings", settingsRouter);
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

apiRouter.get("/debug-env", (req, res) => {
  const safeEnv: any = {};
  for (const key in process.env) {
    if (key.includes('PG') || key.includes('DATABASE') || key.includes('PORT') || key.includes('VITE')) {
      safeEnv[key] = process.env[key];
    }
  }
  res.json(safeEnv);
});
