import { Card } from "shared/cards";

export type UserSession = {
  id?: string;
  email: string;
  name: string;
  image: string;
  rank?: number;
};

export type Player = UserSession & {
  hand: Card[];
  table: Card[];
  isOnline?: boolean;
  status?: "chosing" | "playing";
  userId: string;
};


export type PopulatedPlayer = Player & {
  user: UserSession;
};