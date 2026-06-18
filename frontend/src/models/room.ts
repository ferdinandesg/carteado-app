import { Card } from "shared/cards";
import { Participant } from "shared/types";
import { UserSession } from "./Users";

export type RoomStatus = "open" | "playing" | "finished";
export type RoomRule = "CarteadoGameRules" | "TrucoGameRules";

export interface RoomInterface {
  id: string;
  hash: string;
  name: string;
  status: RoomStatus;
  size: number;
  participants: Participant[];
  rule: RoomRule;
  createdAt: string;
  owner?: UserSession;
  ownerId?: string;
  chatId?: string;
  bunch?: Card[];
}
