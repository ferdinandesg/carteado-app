import { User } from "@prisma/client";
import { GuestType } from "shared/types";
export {};

declare global {
  namespace Express {
    export interface Request {
      user: User | GuestType;
    }
  }
}
