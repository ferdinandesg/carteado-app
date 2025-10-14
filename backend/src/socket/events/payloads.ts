import { PlayerStatus } from "shared/game";
import { Card } from "shared/cards";

export interface JoinRoomPayload {
  roomHash: string;
}

export interface LeaveRoomPayload {
  roomHash: string;
}

export interface PlayerReconnectedPayload {
  roomHash: string;
  userId: string;
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EndTurnPayload {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawTablePayload {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AskTrucoPayload {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RejectTrucoPayload {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AcceptTrucoPayload {}

export interface JoinChatPayload {
  roomHash: string;
}

export interface SendMessagePayload {
  message: string;
  roomHash: string;
}
