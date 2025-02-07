import { Card } from "shared/cards";
import { Player } from "shared/types";

export type RoomStatus = "open" | "playing" | "finished";

export interface RoomInterface {
  id: string;
  chatId: string;
  createdAt: string;
  hash: string;
  name: string;
  status: "open" | "playing";
  size: number;
  players: Player[];
  bunch: Card[];
  rule: "CarteadoGameRules" | "TrucoGameRules";
}
