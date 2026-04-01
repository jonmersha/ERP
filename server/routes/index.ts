import { Router } from "express";
import { productionRouter } from "./production.js";
import { productRouter } from "./products.js";
import { inventoryRouter } from "./inventory.js";

export const apiRouter = Router();

apiRouter.use("/production", productionRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/inventory", inventoryRouter);

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
