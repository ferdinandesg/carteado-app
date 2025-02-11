import { Card } from "../cards";
import { User } from "./guest";

export type Player = {
  hand: Card[];
  name?: string;
  table: Card[];
  isOnline?: boolean;
  status?: "choosing" | "playing";
  image?: string;
  userId: string;
};

export type PlayerWithUser = Player & {
  user: User;
};

export type Team = {
  id: "TEAM_A" | "TEAM_B";
  userIds: string[];
  points: number;
  roundPoints: number;
};
export interface GameState {
  players: PlayerWithUser[];
  bunch: Card[];
  hand: Card[];
  table: Card[];
  playedCards: Card[];
  playerTurn: string;
  winner: string | null;
  status: "playing" | "finished";
  vira: Card;
  manilha: string;
  rounds: number;
  trucoAcceptedBy: string;
  trucoAskedBy: string;
  currentBet?: number;
  teams: Team[];
  rulesName: "CarteadoGameRules" | "TrucoGameRules";
  deck: {
    cards: Card[];
    numberOfFullDecks: number;
  };
}
