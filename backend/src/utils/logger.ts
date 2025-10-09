import pino from "pino";
const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  transport: undefined as pino.TransportSingleOptions | undefined,
  base: {
    service: "backend",
  },
};

// Habilita o pino-pretty APENAS em ambiente de desenvolvimento
if (process.env.NODE_ENV !== "production") {
  pinoConfig.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

// Cria o logger com a configuração condicional
export const logger = pino(pinoConfig);
