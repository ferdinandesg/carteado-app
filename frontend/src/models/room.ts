import { Card } from "shared/cards";
import { Participant } from "shared/types";

export type RoomStatus = "open" | "playing" | "finished";

export interface RoomInterface {
  id: string;
  chatId: string;
  createdAt: string;
  hash: string;
  name: string;
  status: "open" | "playing";
  size: number;
  participants: Participant[];
  bunch: Card[];
  rule: "CarteadoGameRules" | "TrucoGameRules";
}
