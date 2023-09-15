import { Card } from "../Cards";

export type UserSession = {
  id?: string;
  email: string;
  name: string;
  image: string;
  rank?: number;
};

export type Player = {
  hand: Card[];
  table: Card[];
  user: UserSession;
  isOnline?: boolean;
  status?: "choosing" | "playing";
  // userId: string;
};
