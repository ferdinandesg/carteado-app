import { JWT } from "next-auth/jwt";
import { UserRole } from "shared/types";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id?: string;
      email: string;
      name: string;
      image?: string;
      token?: JWT | undefined;
      rank?: number;
      accessToken?: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    role: UserRole;
  }
}
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** The user's postal address. */
    id?: string;
    email: string;
    name: string;
    sub: string;
    iat: string;
    picture: string;
    jti: string;
  }
}
