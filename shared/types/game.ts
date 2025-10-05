import { PlayerStatus } from "shared/game";
import { Card } from "../cards";
import { User } from "./guest";

export type Player = {
  id: string;
  hand: Card[];
  name?: string;
  table: Card[];
  isOnline?: boolean;
  status?: PlayerStatus;
  image?: string;
  userId: string;
};

export type PlayerWithUser = Player & {
  user: User;
};

export type HandResult = {
  winnerTeamId?: string | null;
  bunch: Card[];
  round: number;
};

export type Team = {
  id: "TEAM_A" | "TEAM_B";
  userIds: string[];
  roundWins: number;
  score: number;
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
  handsResults: HandResult[];
  deck: {
    cards: Card[];
    numberOfFullDecks: number;
  };
}
