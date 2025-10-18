import { Card } from "../cards";

export type HandResult = {
  winnerTeamId?: string | null;
  bunch: Card[];
  isTie: boolean;
  round: number;
};

export type Team = {
  id: "TEAM_A" | "TEAM_B";
  userIds: string[];
  roundWins: number;
  score: number;
};