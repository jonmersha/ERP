import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Log requests
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API routes
  app.use("/api", apiRouter);

  // If we want this server to ALSO serve static files when separate
  const distPath = path.join(process.cwd(), "..", "dist");
  if (process.env.SERVE_STATIC === "true") {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
          if (!req.url.startsWith('/api')) {
              res.sendFile(path.join(distPath, "index.html"));
          }
      });
  }

  // Health check at root for convenience
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "erp-backend" });
  });

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`ERP Backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start ERP Backend:", err);
});
