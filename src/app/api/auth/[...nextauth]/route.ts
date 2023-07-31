// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, token, user }) {
      return session; // The return type will match the one returned in `useSession()`
    },
    redirect() {
      return "/game";
    },
  },
});

export { handler as GET, handler as POST };
