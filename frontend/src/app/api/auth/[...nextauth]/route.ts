import axiosInstance from "@/hooks/axios";
import { UserSession } from "@/models/Users";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import Credentials from "next-auth/providers/credentials";
import { GuestType } from "shared/types";

const validateUser = async (payload: UserSession) => {
  const response = await axiosInstance.post("/auth", payload);
  const user = await response.data;
  return user;
};

const validateGuestUser = async (name: string) => {
  const response = await axiosInstance.post("/auth/guest", {
    username: name,
  });
  const user = await response.data;
  return user;
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "secret",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.username) {
          const guestUser = await validateGuestUser(credentials.username);
          if (!guestUser) return null;
          return guestUser;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        const assignUserToToken = (user: UserSession | GuestType) => {
          const secretKey = "secret";
          const encodedToken = jwt.sign(
            { id: user.id, role: user.role },
            secretKey
          );
          console.log({
            encodedToken,
          });
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.role = user.role;
          token.accessToken = encodedToken;
        };

        if (user.role === "guest") {
          assignUserToToken(user as GuestType);
        } else {
          try {
            const validatedUser = await validateUser(user as UserSession);
            assignUserToToken(validatedUser);
          } catch (error) {
            console.error("Erro na validação do usuário:", error);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      try {
        session.user.accessToken = token.accessToken as string;
        session.user.id = token.id;
        session.user.token = token;
        return session;
      } catch (error) {
        console.error("Erro na criação da sessão:", error);
        return session;
      }
    },

    redirect() {
      return "/menu";
    },
  },
  pages: {
    signIn: "/",
    error: "/?error=oauth",
  },
  theme: { colorScheme: "dark" },
});

export { handler as GET, handler as POST };
