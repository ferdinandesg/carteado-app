import pino from "pino";

const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "frontend",
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
