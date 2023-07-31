import { CHANNEL } from "../socket/channels";
import SocketClass from "../socket/socket";
import { RoomInterface } from "./room.schema";

const ROOMS: RoomInterface[] = [];
export function createRoom(room: RoomInterface) {
  try {
    ROOMS.push(room);
    return { inserted: true };
  } catch (error) {
    throw error;
  }
}

export function listRooms() {
  try {
    return { rooms: ROOMS };
  } catch (error) {
    throw error;
  }
}

export function joinRoom(hash: string, player: string) {
  try {
    const room = ROOMS.find((x) => x.hash === hash);
    if (!room) throw "Room not found";
    room.players.push(player);
    SocketClass.io.to(hash).emit(CHANNEL.SERVER.PLAYER_JOINED, player);
  } catch (error) {
    throw error;
  }
}
