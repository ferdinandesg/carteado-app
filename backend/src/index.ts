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
const httpServer = http.createServer(app);
RedisClass.getInstance();
SocketClass.init(httpServer);
process.on("uncaughtException", (err) => {
  console.error("Exceção não capturada detectada:", err);
});

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
});

app.use(limiter);

process.on("unhandledRejection", (reason) => {
  console.error("Promise rejeitada sem tratamento:", reason);
});
httpServer.listen(process.env.PORT, () =>
  console.log(`Running on: ${process.env.PORT}`)
);
