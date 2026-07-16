import pino from "pino";

/**
 * Convenção: logger.info({ campo }, "Short English sentence.")
 * Erros: { err }. Em produção → JSON no stdout.
 */
const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "frontend",
    version: process.env.APP_VERSION || "dev",
  },
};

if (process.env.NODE_ENV !== "production") {
  pinoConfig.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

const logger = pino(pinoConfig);

export default logger;
