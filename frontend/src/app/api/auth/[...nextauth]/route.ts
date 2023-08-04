// pages/api/auth/[...nextauth].js
import { UserSession } from "@/models/Users";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const validateUser = async (payload: UserSession) => {
  try {
    const response = await fetch(`http://localhost:3001/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const user = response.json();
    return user;
  } catch (error) {
    console.log({ error });

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
        console.log("Updated session.");
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
