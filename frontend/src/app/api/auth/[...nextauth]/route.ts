import { UserSession } from "@/models/Users";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import Credentials from "next-auth/providers/credentials";
import { UserRole } from "shared/types";
import axios from "axios";
import logger from "@/tests/utils/logger";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

const validateUser = async (payload: UserSession) => {
  const response = await axiosInstance.post("/auth", payload);
  return response.data;
};

const validateGuestUser = async (name: string) => {
  const response = await axiosInstance.post("/auth/guest", { username: name });
  return response.data;
};

const generateJWT = ({ id, role }: { id: string; role: UserRole }) => {
  const secretKey = process.env.NEXTAUTH_SECRET!;
  logger.info("Generating JWT");
  return jwt.sign({ id: id, role: role }, secretKey);
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        return validateGuestUser(credentials.username);
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      console.log({
        user,
        token,
      });
      if (account && user) {
        try {
          const userData =
            user.role === "guest"
              ? user
              : await validateUser(user as UserSession);
          token.id = userData.id;
          token.name = userData.name;
          token.email = userData.email;
          token.role = userData.role;
        } catch (error) {
          console.error("Erro na validação do usuário:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      try {
        logger.info(token, "Criando sessão para o token:");
        const accessToken = generateJWT({
          id: String(token.id),
          role: String(token.role) as UserRole,
        });
        session.user.id = token.id;
        session.user.accessToken = accessToken;
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
