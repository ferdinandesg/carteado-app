import { Card } from "../cards";

export type Player = {
  hand: Card[];
  name?: string;
  table: Card[];
  isOnline?: boolean;
  status?: "choosing" | "playing";
  image?: string;
  userId: string;
};

export interface GameState {
  players: Player[];
  bunch: Card[];
  hand: Card[];
  table: Card[];
  playedCards: Card[];
  playerTurn: string;
  winner: string | null;
  status: "playing" | "finished";
  deck: {
    cards: Card[];
    numberOfFullDecks: number;
  };
}
