import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import SocketClass from "./socket/socket";
import routes from "./routes";
const app = express();
app.use(express.json());
app.use(cors());
routes(app);
const httpServer = http.createServer(app);
SocketClass.init(httpServer);
httpServer.listen(process.env.PORT, () =>
  console.log(`Running on: ${process.env.PORT}`)
);
