import { AuthenticatedUser } from "shared/types/guest";

declare global {
  namespace Express {
    export interface Request {
      user: AuthenticatedUser;
    }
  }
}
