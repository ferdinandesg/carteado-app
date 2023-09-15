import { Card } from "./Cards";
import { Player } from "./Users";

export type RoomStatus = "open" | "playing";

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
}
