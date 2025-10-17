import { UserSession } from "@//models/Users";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import Credentials from "next-auth/providers/credentials";
import { UserRole } from "shared/types";
import axios from "axios";
import logger from "@//tests/utils/logger";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

const validateUser = async (payload: UserSession) => {
  const response = await axiosInstance.post("/auth", payload);
  return response.data;
};

const validateGuestUser = async ({
  username,
  skin,
  avatar,
}: {
  username: string;
  skin?: string;
  avatar?: string;
}) => {
  const response = await axiosInstance.post("/auth/guest", {
    username,
    skin,
    avatar,
  });
  return response.data;
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        avatar: { label: "Avatar", type: "text", optional: true },
        skin: { label: "Skin", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        return validateGuestUser(credentials);
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
        try {
          const userData =
            account.provider === "google"
              ? await validateUser(user as UserSession)
              : user;

          return {
            ...token,
            id: userData.id,
            role: userData.role,
            skin: userData.skin,
            name: userData.name ?? token.name,
            email: userData.email ?? token.email,
            image: userData.image ?? token.image,
          };
        } catch (error) {
          logger.error(
            error,
            "Erro ao validar/processar usuário no callback JWT"
          );
          return { ...token, error: "UserValidationError" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.role = token.role as UserRole;
      session.user.skin = token.skin;
      session.user.accessToken = jwt.sign(token, process.env.NEXTAUTH_SECRET!);

      return session;
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
