import { PlayerStatus } from "shared/game";
import { Card } from "shared/cards";

export interface JoinRoomPayload {
  roomHash: string;
}

export interface LeaveRoomPayload {
  roomHash: string;
}

export interface SetPlayerStatusPayload {
  status: PlayerStatus;
}

export interface StartGamePayload {
  roomHash: string;
}

export interface PlayCardPayload {
  card: Card;
}

export interface PickHandPayload {
  cards: Card[];
}

export interface RetrieveCardPayload {
  card: Card;
}

export type EndTurnPayload = Record<string, never>;
export type DrawTablePayload = Record<string, never>;
export type AskTrucoPayload = Record<string, never>;
export type RejectTrucoPayload = Record<string, never>;
export type AcceptTrucoPayload = Record<string, never>;

export interface JoinChatPayload {
  roomHash: string;
}

export interface SendMessagePayload {
  message: string;
  roomHash: string;
}

/** Mensagem de chat como emitida pelo servidor (persistida ou de sistema). */
export interface ChatMessage {
  name: string;
  message: string;
  createdAt?: string | Date;
}

export interface SystemNoticePayload {
  message: string;
}
