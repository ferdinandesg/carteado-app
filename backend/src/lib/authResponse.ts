import { signAccessToken } from "@/lib/jwt";
import { UserRole } from "shared/types";

type AuthIdentity = {
  id: string;
  role: UserRole;
};

export function withAccessToken<T extends AuthIdentity>(
  user: T
): T & { accessToken: string } {
  return {
    ...user,
    accessToken: signAccessToken({ id: user.id, role: user.role }),
  };
}
