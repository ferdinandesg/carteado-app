import { Socket } from "socket.io";
import { verifyJWTToken } from "@/routes/middlewares/auth";

export async function Authentication(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  const token = socket.handshake.auth.token;
  const user = await verifyJWTToken(token);
  if (!user) return next(new Error("Unauthorized"));
  socket.user = user;

  socket.join(socket.user.email);
  return next();
}
