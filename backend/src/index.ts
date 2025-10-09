import "dotenv/config";
import "module-alias/register";
import express from "express";
import http from "http";
import cors from "cors";
import SocketClass from "./socket/socket";
import routes from "./routes";
import RedisClass from "./redis/client";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import PinoHttp from "pino-http";

const app = express();
app.use(express.json());
app.use(cors());
routes(app);

app.use(PinoHttp({ logger }));
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
    logger.error(err, "Exceção não capturada detectada:");
  }
});

process.on("unhandledRejection", (reason) => {
  if (process.env.NODE_ENV !== "production") {
    logger.error(reason, "Promise rejeitada sem tratamento:");
  }
});
httpServer.listen(env.PORT, () => {
  logger.info(`Running on: ${env.PORT}`);
});

export default httpServer;
