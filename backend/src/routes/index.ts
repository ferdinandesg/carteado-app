import { Application } from "express";
import roomRoutes from "../room/room.routes";
const BASE_API = "/api";
export default function routes(app: Application) {
  app.use(`${BASE_API}/rooms`, roomRoutes);
}
