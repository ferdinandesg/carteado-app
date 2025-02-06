import emitToUser from "@socket/utils/emitToUser";
import { Socket } from "socket.io";

type CustomError = {
  error: boolean;
  message: string;
};

export default function ErrorHandler(
  error: unknown | CustomError,
  socket: Socket
) {
  console.log("Error: ", error);
  if (typeof error === "string") {
    return emitToUser(socket, "error", error);
  }

  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    "message" in error
  ) {
    return emitToUser(socket, "error", error.message);
  }
  throw error;
}
