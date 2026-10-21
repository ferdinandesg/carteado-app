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
    logger.info({ port: env.PORT }, "Server started.");
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
    logger.info({ signal, value }, "Shutting down server.");
    server.close(async () => {
      await RedisClass.disconnect();
      logger.info("Server stopped.");
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
  logger.error({ err }, "Failed to start server.");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception.");
  process.exit(1);
});

function extractReasonMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;
  return "UNKNOWN_REJECTION_REASON";
}

// Mantém o processo vivo de propósito: o ErrorHandler do socket relança erros
// que não são GameError, e derrubar aqui viraria restart em produção.
process.on("unhandledRejection", (reason) => {
  const reasonMessage = extractReasonMessage(reason);
  logger.error(
    { err: reason, reasonMessage },
    "Unhandled promise rejection; keeping process alive."
  );
  return;
});
