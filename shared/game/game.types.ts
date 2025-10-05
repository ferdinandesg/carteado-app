import { Card } from "shared/cards";
import { PlayerStatus } from "./base.player";

export enum GameStatus {
  OPEN = "open",
  PLAYING = "playing",
  FINISHED = "finished",
}

export interface GamePlayer {
  userId: string;
  status: PlayerStatus;
  hand: Card[];
  playedCards: Card[];
  table: Card[];
  teamId?: string;
}
