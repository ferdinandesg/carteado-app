import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: ["/menu/:path*", "/rooms/:path*", "/room/:path*"],
};
