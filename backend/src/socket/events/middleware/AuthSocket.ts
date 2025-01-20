import { Socket } from "socket.io";
import { validateUser } from "../../../auth/auth.service";

export async function Authentication(
  socket: Socket,
  next: Function
): Promise<void> {
  try {
    console.log({
      query: socket.handshake.query
    })
    const { user } = socket.handshake.query;
    const parsedUser = JSON.parse(String(user));

    const auth = await validateUser(parsedUser);
    socket.user = auth;
 
    socket.join(socket.user.email);
    return next(null, true);
  } catch (error) {
    console.error({ error });
  }
}
