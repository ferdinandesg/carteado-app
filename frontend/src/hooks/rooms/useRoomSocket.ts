import { useEffect } from "react";
import type { Socket } from "socket.io-client";

import { RoomInterface } from "@/models/room";

type UseRoomSocketOptions = {
  roomHash: string;
  socket: Socket;
  isConnected: boolean;
  authReady: boolean;
  updateRoom: (room: RoomInterface) => void;
};

export function useRoomSocket({
  roomHash,
  socket,
  isConnected,
  authReady,
  updateRoom,
}: UseRoomSocketOptions) {
  useEffect(() => {
    if (!roomHash || !authReady) return;

    const syncRoom = (room: RoomInterface) => updateRoom(room);
    const onRoomJoined = (payload: { room: RoomInterface }) =>
      syncRoom(payload.room);

    socket.on("room_updated", syncRoom);
    socket.on("room_joined", onRoomJoined);

    return () => {
      socket.off("room_updated", syncRoom);
      socket.off("room_joined", onRoomJoined);
    };
  }, [roomHash, socket, authReady, updateRoom]);

  useEffect(() => {
    if (!roomHash || !authReady || !isConnected) return;
    socket.emit("join_room", { roomHash });
  }, [roomHash, socket, authReady, isConnected]);
}
