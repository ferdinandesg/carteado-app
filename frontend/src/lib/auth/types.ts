import { UserRole } from "shared/types";

export type AuthApiResponse = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  image?: string | null;
  skin?: string | null;
  rank: number;
  cash: number;
  xp: number;
  accessToken: string;
};

export type AuthProfileResponse = Omit<AuthApiResponse, "accessToken">;
