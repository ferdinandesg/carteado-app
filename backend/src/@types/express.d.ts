import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}


declare module "express-serve-static-core" {
    interface Request {
        user?: User;
    }
  }