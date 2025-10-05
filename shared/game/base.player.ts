import { Card } from "../cards";

export enum PlayerStatus {
  CHOOSING = "choosing",
  PLAYING = "playing",
  NOT_READY = "not_ready",
  READY = "ready",
}

export type BasePlayer = {
  userId: string;
  status: PlayerStatus;
  hand: Card[];
  playedCards: Card[];
  table: Card[];
};
