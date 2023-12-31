import { Socket } from "socket.io";
import { validateUser } from "../../../auth/auth.service";

export async function Authentication(
  socket: Socket,
  next: Function
): Promise<void> {
  try {
    const { user } = socket.handshake.query;

    const parsedUser = JSON.parse(String(user));
    const auth = await validateUser(parsedUser);
    socket.user = auth;
    socket.join(socket.user.email);
    socket.emit("authenticate", auth.id);

    return next(null, true);
  } catch (err) {
    console.error({ err });
  }
}
