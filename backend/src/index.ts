import "dotenv/config";
import "module-alias/register";
import express from "express";
import http from "http";
import cors from "cors";
import SocketClass from "./socket/socket";
import routes from "./routes";
import RedisClass from "./redis/client";
import rateLimit from "express-rate-limit";
const app = express();
app.use(express.json());
app.use(cors());
routes(app);

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
  console.error("Exceção não capturada detectada:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Promise rejeitada sem tratamento:", reason);
});
httpServer.listen(process.env.PORT, () =>
  console.log(`Running on: ${process.env.PORT}`)
);

export default httpServer;
