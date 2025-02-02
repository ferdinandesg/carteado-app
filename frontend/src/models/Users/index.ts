import { Player } from "shared/types";

export type UserSession = {
  id?: string;
  email: string;
  name: string;
  image: string;
  rank?: number;
  role?: string;
};

export type PopulatedPlayer = Player &
  UserSession & {
    user: UserSession;
  };
