import { PlayerStatus } from "shared/game";
import { Card } from "shared/cards";
import { User } from "./guest";

export interface Participant {
  id?: string; // Para vincular ao usuário no DB
  userId: string; // Para vincular ao usuário no DB
  socketId: string; // Essencial para comunicação em tempo real
  name: string; // Denormalizado para evitar buscas no DB
  image?: string; // Denormalizado para conveniência
  status: PlayerStatus; // Estado em tempo real
  isRegistered: boolean; // Indica se é um usuário registrado ou um convidado
  isOnline: boolean; // Indica se o jogador está online
}

export type RoomStatus = "open" | "playing" | "finished";
export type RoomRule = "CarteadoGameRules" | "TrucoGameRules";

/** Dono da sala como devolvido pela API (campos além do básico são opcionais). */
export type RoomOwner = Pick<User, "name" | "email" | "image"> &
  Partial<Omit<User, "name" | "email" | "image">>;

/** Sala como trafegada entre API/socket e o cliente. */
export interface RoomInterface {
  id: string;
  hash: string;
  name: string;
  status: RoomStatus;
  size: number;
  participants: Participant[];
  rule: RoomRule;
  createdAt: string;
  owner?: RoomOwner;
  ownerId?: string;
  chatId?: string;
  bunch?: Card[];
}
