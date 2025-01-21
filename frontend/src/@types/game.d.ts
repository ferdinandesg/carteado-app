import { Player } from "@/models/Users";
import Deck from "shared/cards";

export interface GameState {
  players: Player[];
  bunch: Card[];
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