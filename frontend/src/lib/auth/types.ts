import { UserRole } from "shared/types";

export type AuthApiResponse = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  image?: string | null;
  skin?: string;
  accessToken: string;
};
