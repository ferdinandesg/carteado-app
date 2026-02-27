import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import PinoHttp from "pino-http";
import routes from "./routes";
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

// Health check (sem rate limit para permitir healthchecks do Docker/K8s)
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(limiter);
routes(app);

export { app };
