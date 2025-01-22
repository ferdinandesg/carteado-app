import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import SocketClass from "./socket/socket";
import routes from "./routes";
import RedisClass from "./redis/client";
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

process.on("unhandledRejection", (reason, promise) => {
  console.error("Promise rejeitada sem tratamento:", reason);
});
httpServer.listen(process.env.PORT, () =>
  console.log(`Running on: ${process.env.PORT}`)
);
