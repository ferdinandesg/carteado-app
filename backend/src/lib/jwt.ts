import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UserRole } from "shared/types";

export type AccessTokenPayload = {
  id: string;
  role: UserRole;
};

/** Alinhado com REDIS_TTL.guest e sessão NextAuth (~30 dias). */
export const ACCESS_TOKEN_EXPIRES_IN = "30d";

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export async function verifyAccessToken(
  token: string | undefined
): Promise<AccessTokenPayload | null> {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET_KEY);
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("id" in decoded) ||
      !("role" in decoded)
    ) {
      return null;
    }
    return decoded as AccessTokenPayload;
  } catch {
    return null;
  }
}
