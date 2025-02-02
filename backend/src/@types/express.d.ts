import { GuestType, SocketUser } from "shared/types";

declare global {
  namespace Express {
    export interface Request {
      user: SocketUser | GuestType;
    }
  }
}
