import { Socket } from "socket.io";
import { verifyJWTToken } from "@/routes/middlewares/auth";
import { touchGuest } from "@/lib/redis/guests";

export async function Authentication(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth.token as string | undefined;
    const user = await verifyJWTToken(token);
    if (!user) return next(new Error("Unauthorized"));

    if (user.role === "guest") {
      await touchGuest(user.id);
    }

    socket.user = user;
    socket.join(socket.user.email);
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
}
