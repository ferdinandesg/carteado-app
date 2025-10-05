import { PlayerStatus } from "shared/game";

export interface Participant {
  id?: string; // Para vincular ao usuário no DB
  userId: string; // Para vincular ao usuário no DB
  socketId: string; // Essencial para comunicação em tempo real
  name: string; // Denormalizado para evitar buscas no DB
  image?: string; // Denormalizado para conveniência
  status: PlayerStatus; // Estado em tempo real
  isRegistered: boolean; // Indica se é um usuário registrado ou um convidado
}
