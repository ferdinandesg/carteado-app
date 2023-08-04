import { Application } from "express";
import roomRoutes from "../room/room.routes";
import authRoutes from "../auth/auth.routes";
const BASE_API = "/api";
export default function routes(app: Application) {
  app.use(`${BASE_API}/rooms`, roomRoutes);
  app.use(`${BASE_API}/auth`, authRoutes);
}
