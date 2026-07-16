import { Socket } from "socket.io";
import ErrorHandler from "@/utils/error.handler";
import { socketLogger } from "@/utils/logContext";

type SocketEventHandler<TPayload> = (payload: TPayload) => void | Promise<void>;

export function registerSafeSocketEvent<TPayload = unknown>(
  socket: Socket,
  eventName: string,
  handler: SocketEventHandler<TPayload>
): void {
  socket.on(eventName, (payload: TPayload) => {
    void Promise.resolve(handler(payload)).catch((error) => {
      try {
        ErrorHandler(error, socket);
      } catch (unhandledError) {
        socketLogger(socket).error(
          { err: unhandledError, eventName },
          "Unhandled socket event error."
        );
      }
    });
  });
}
