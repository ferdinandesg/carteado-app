import emitToUser from "@socket/utils/emitToUser";
import { Socket } from "socket.io";
import { GameError } from "src/errors/GameError";

type CustomError = {
  error: boolean;
  message: string;
};

export default function ErrorHandler(
  error: unknown | CustomError,
  socket: Socket
) {
  if (typeof error === "string") {
    return emitToUser(socket, "error", error);
  }

  // Check if is GameError Error
  if (error instanceof GameError) {
    return emitToUser(socket, "error", error.message);
  }
  throw error;
}
