import { JWT } from "next-auth/jwt";
import { UserRole } from "shared/types";

declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
      id: string;
      role: UserRole;
      accessToken: string;
      skin?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    accessToken: string;
    skin?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accessToken: string;
    skin?: string;
    error?: string;
  }
}
