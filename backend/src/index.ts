import "dotenv/config";
import "module-alias/register";
import express from "express";
import http from "http";
import cors from "cors";
import SocketClass from "./socket/socket";
import routes from "./routes";
import RedisClass from "./redis/client";
import rateLimit from "express-rate-limit";
import PinoHttp from "pino-http";
import { env } from "./config/env";
import pino from "pino";
const app = express();
app.use(express.json());
app.use(cors());
routes(app);

const logger = pino({
  level: process.env.LOG_LEVEL || "info", // Define o nível do log
  transport: {
    target: "pino-pretty", // Opcional: formata o log para ficar legível no console de desenvolvimento
    options: {
      colorize: true,
    },
  },
});
const httpLogger = PinoHttp({ logger });
app.use(httpLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
const httpServer = http.createServer(app);
RedisClass.getDataClient();
SocketClass.init(httpServer);
process.on("uncaughtException", (err) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("Exceção não capturada detectada:", err);
  }
});

process.on("unhandledRejection", (reason) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("Promise rejeitada sem tratamento:", reason);
  }
});
httpServer.listen(env.PORT, () => {
  console.log(`Running on: ${env.PORT}`);
});

export default httpServer;
