import axiosInstance from "@/hooks/axios";
import { UserSession } from "@/models/Users";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const validateUser = async (payload: UserSession) => {
  const response = await axiosInstance.post("/auth", payload);
  const user = await response.data;
  return user;
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const validatedUser = await validateUser(user as UserSession);
          token.id = validatedUser.id;
          token.name = validatedUser.name;
          token.email = validatedUser.email;
          token.role = validatedUser.role;
        } catch (error) {
          console.error("Erro na validação do usuário:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      try {
        session.user.id = token.id;
        session.user.token = token;
        return session; // The return type will match the one returned in `useSession()`
      } catch (error) {
        console.error("Erro na criação da sessão:", error);
        return session;
      }
    },

    redirect() {
      return "/menu";
    },
  },

  theme: { colorScheme: "dark" },
});

export { handler as GET, handler as POST };
