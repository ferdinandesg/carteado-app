import { Application } from "express";
import roomRoutes from "./room.routes";
import authRoutes from "./auth.routes";
import gameRoutes from "./game.routes";
const BASE_API = "/api";
export default function routes(app: Application) {
  app.use(`${BASE_API}/rooms`, roomRoutes);
  app.use(`${BASE_API}/game`, gameRoutes);
  app.use(`${BASE_API}/auth`, authRoutes);
}
