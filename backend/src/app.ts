import "dotenv/config";
import "module-alias/register";
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

app.use(limiter);
app.use(PinoHttp({ logger }));

routes(app);

export { app };
