import "dotenv/config";
import http from "http";
import { app } from "./app";
import RedisClass from "@/lib/redis/client";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { SocketServer } from "@/socket/socket";

async function bootstrap() {
  await RedisClass.getDataClient();

  const httpServer = http.createServer(app);
  new SocketServer(httpServer);

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port: ${env.PORT}`);
  });

  const signals = {
    SIGHUP: 1,
    SIGINT: 2,
    SIGTERM: 15,
  };

  const shutdown = async (
    signal: keyof typeof signals,
    value: number
  ): Promise<void> => {
    logger.info(`signal ${signal}, value ${value}. Shutting down...`);
    server.close(async () => {
      await RedisClass.disconnect();
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
}

bootstrap().catch((err) => {
  logger.error(err, "Failed to start server");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(err, "Exceção não capturada detectada:");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason, "Promise rejeitada sem tratamento:");
  process.exit(1);
});
