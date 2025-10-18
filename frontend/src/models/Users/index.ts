import { BasePlayer } from "shared/game";

export type UserSession = {
  id?: string;
  email: string;
  name: string;
  image: string;
  rank?: number;
  role?: string;
};

export type PopulatedPlayer = BasePlayer &
  UserSession & {
    user: UserSession;
  };
