import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";
import { UserRole } from "shared/types";
import type { UserSession } from "@/models/Users";
import {
  fetchCurrentAuthProfile,
  registerGoogleUser,
  registerGuestUser,
} from "@/lib/auth/backend-client";
import type { AuthApiResponse, AuthProfileResponse } from "@/lib/auth/types";
import logger from "@/lib/logger";

const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;
const PROFILE_REFRESH_INTERVAL_MS = 60 * 1000;

function mapAuthToJwt(
  auth: AuthApiResponse | AuthProfileResponse,
  accessToken?: string
) {
  const resolvedAccessToken = (
    "accessToken" in auth ? auth.accessToken : accessToken
  ) as string;

  return {
    id: auth.id,
    role: auth.role,
    skin: auth.skin ?? undefined,
    name: auth.name,
    email: auth.email,
    image: auth.image,
    rank: auth.rank,
    cash: auth.cash,
    xp: auth.xp,
    accessToken: resolvedAccessToken,
    profileSyncedAt: Date.now(),
  };
}

function shouldRefreshProfile(profileSyncedAt: unknown) {
  return (
    typeof profileSyncedAt !== "number" ||
    Date.now() - profileSyncedAt > PROFILE_REFRESH_INTERVAL_MS
  );
}

async function resolveAuthProfile(
  accountProvider: string | undefined,
  user: User
): Promise<AuthApiResponse> {
  if (accountProvider === "google") {
    return registerGoogleUser(user as UserSession);
  }
  return user as AuthApiResponse;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS_SEC,
  },
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
        return registerGuestUser({
          username: credentials.username,
          skin: credentials.skin,
          avatar: credentials.avatar,
        });
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
          const auth = await resolveAuthProfile(account.provider, user);
          return { ...token, ...mapAuthToJwt(auth) };
        } catch (error) {
          logger.error(
            { err: error },
            "Falha ao validar usuário no callback JWT"
          );
          return { ...token, error: "UserValidationError" };
        }
      }

      if (
        typeof token.accessToken === "string" &&
        shouldRefreshProfile(token.profileSyncedAt)
      ) {
        try {
          const profile = await fetchCurrentAuthProfile(token.accessToken);
          return {
            ...token,
            ...mapAuthToJwt(profile, token.accessToken),
            error: undefined,
          };
        } catch (error) {
          logger.error(
            { err: error },
            "Falha ao atualizar perfil do usuário no callback JWT"
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error as string;
        return session;
      }

      session.user.id = token.id as string;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.role = token.role as UserRole;
      session.user.skin = token.skin as string | undefined;
      session.user.rank = token.rank as number;
      session.user.cash = token.cash as number;
      session.user.xp = token.xp as number;
      session.user.accessToken = token.accessToken as string;

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
};
