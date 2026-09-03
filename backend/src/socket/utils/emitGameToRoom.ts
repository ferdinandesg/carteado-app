import type { Namespace, Socket } from "socket.io";
import {
  isTrucoGame,
  maskIllusionsForViewer,
  type IGameState,
} from "shared/game";

import { CHANNEL } from "@/socket/channels";

/**
 * Snapshot exatamente como o socket.io serializaria a instância
 * (`rules` vira `{}`, campos `undefined` somem).
 */
function toWireState(game: object): IGameState {
  return JSON.parse(JSON.stringify(game)) as IGameState;
}

/** Estado que um jogador específico pode ver (ex.: segredo do Ilusionista só para o time). */
export function projectGameForViewer(
  game: object,
  viewerId: string
): IGameState {
  const state = toWireState(game);
  return isTrucoGame(state) ? maskIllusionsForViewer(state, viewerId) : state;
}

export function emitGameToUser(socket: Socket, game: object): void {
  socket.emit(
    CHANNEL.SERVER.GAME_UPDATED,
    projectGameForViewer(game, socket.user.id)
  );
}

/** `game_updated` para cada socket da sala, já projetado para o seu usuário. */
export function emitGameToRoom(
  channel: Namespace,
  roomHash: string,
  game: object
): void {
  const socketIds = channel.adapter.rooms.get(roomHash);
  if (!socketIds) return;
  for (const id of socketIds) {
    const socket = channel.sockets.get(id);
    if (socket) emitGameToUser(socket, game);
  }
}
