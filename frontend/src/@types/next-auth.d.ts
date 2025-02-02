import { JWT } from "next-auth/jwt";

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
      role: "guest" | "user";
    };
  }

  interface User {
    id: string;
    role: "guest" | "user";
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
