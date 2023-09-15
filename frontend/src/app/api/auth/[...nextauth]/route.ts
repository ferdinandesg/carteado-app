// pages/api/auth/[...nextauth].js
import { UserSession } from "@/models/Users";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const validateUser = async (payload: UserSession) => {
  try {
    const response = await fetch(`${process.env.API_URL}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const user = await response.json();
    
    return user;
  } catch (error) {
    throw error;
  }
};

const handler = NextAuth({
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        const user = await validateUser(session.user);
        session.user = user;
        return session; // The return type will match the one returned in `useSession()`
      } catch (error) {
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
