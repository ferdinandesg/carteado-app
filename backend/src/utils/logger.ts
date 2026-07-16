import pino from "pino";

/**
 * Convenção de logs (GCS Logs Explorer):
 * - Sempre: logger.info({ campo }, "Short English sentence.")
 * - Erros: { err } (nunca interpolar stack na msg)
 * - User/sessão: userId, role, userName (via req.log / socket.log / customProps)
 * - Produção: JSON no stdout (sem pino-pretty) para o Ops Agent
 */
const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "backend",
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

export const logger = pino(pinoConfig);
