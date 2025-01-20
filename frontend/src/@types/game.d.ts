import { Player } from "@/models/Users";

export interface GameState {
  players: Player[];
  hand: Card[];
  table: Card[];
  playedCards: Card[];
  playerTurn: string;
  winner: string | null;
  status: "playing" | "finished";
  cards: {
    cards: Card[];
    numberOfFullDecks: number
  }
}