import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import PinoHttp from "pino-http";
import routes from "./routes";
import { checkHealth } from "./health";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Muitas requisições, tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(PinoHttp({ logger }));

// Liveness: só confirma que o processo HTTP responde (Docker/K8s); não toca em Redis/Mongo
app.get("/api/v1/live", (_req, res) => {
  res.status(200).json({ status: "up" });
});

// Readiness: dependências (Redis + Mongo)
app.get("/api/v1/health", async (_req, res) => {
  const result = await checkHealth();
  const statusCode = result.status === "ok" ? 200 : 503;
  res.status(statusCode).json(result);
});

app.use(limiter);
routes(app);

export { app };
