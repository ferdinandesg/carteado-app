import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/menu", "/rooms", "/room"];

const authMiddleware = withAuth({
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  if (request.headers.has("next-action")) {
    return NextResponse.json(
      { error: "Server Actions are not supported by this deployment." },
      { status: 400 }
    );
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    return authMiddleware(request as NextRequestWithAuth, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt).*)",
  ],
};
