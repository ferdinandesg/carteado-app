import { Socket } from "socket.io";
import { verifyJWTToken } from "@/routes/middlewares/auth";
import { logger } from "@/utils/logger";
import { userLogBindings } from "@/utils/logContext";

export async function Authentication(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token = socket.handshake.auth.token as string | undefined;
    const user = await verifyJWTToken(token);
    if (!user) return next(new Error("Unauthorized"));

    socket.user = user;
    socket.log = logger.child({
      ...userLogBindings(user),
      socketId: socket.id,
      source: "socket",
    });
    socket.join(socket.user.email);
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
}
