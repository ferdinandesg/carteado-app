import { PlayerStatus, UsePowerPayload } from "shared/game";
import { Card } from "shared/cards";

export type { UsePowerPayload };

export interface JoinRoomPayload {
  roomHash: string;
}

export interface SetPlayerStatusPayload {
  status: PlayerStatus;
}

export interface PlayCardPayload {
  card: Card;
}

export interface PickHandPayload {
  cards: Card[];
}

export interface JoinChatPayload {
  roomHash: string;
}

export interface SendMessagePayload {
  message: string;
  roomHash: string;
}
