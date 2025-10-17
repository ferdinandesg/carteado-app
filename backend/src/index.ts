import "dotenv/config";
import http from "http";
import { app } from "./app";
import RedisClass from "./lib/redis/client";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { SocketServer } from "@/socket/socket";

const httpServer = http.createServer(app);

RedisClass.getDataClient();
new SocketServer(httpServer);

const server = httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port: ${env.PORT}`);
});

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const shutdown = (signal: keyof typeof signals, value: number) => {
  logger.info(`signal ${signal}, value ${value}. Shutting down...`);
  server.close(() => {
    logger.info("Server stopped");
    process.exit(128 + value);
  });
};

Object.keys(signals).forEach((signal) => {
  process.on(signal as keyof typeof signals, () => {
    shutdown(
      signal as keyof typeof signals,
      signals[signal as keyof typeof signals]
    );
  });
});

process.on("uncaughtException", (err) => {
  logger.error(err, "Exceção não capturada detectada:");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason, "Promise rejeitada sem tratamento:");
  process.exit(1);
});

export default httpServer;
