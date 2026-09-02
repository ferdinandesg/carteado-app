import { useEffect } from "react";
import type { RoomInterface } from "shared/types";

import { useSocket } from "@/contexts/socket.context";
import { useSocketEvent } from "@/hooks/socket/useSocketEvent";

type UseRoomSocketOptions = {
  roomHash: string;
  authReady: boolean;
  updateRoom: (room: RoomInterface) => void;
};

/**
 * Mantém a sala sincronizada com o servidor: escuta `room_updated`/`room_joined`
 * e (re)emite `join_room` sempre que o socket conecta.
 */
export function useRoomSocket({
  roomHash,
  authReady,
  updateRoom,
}: UseRoomSocketOptions) {
  const { socket, isConnected } = useSocket();
  const enabled = Boolean(roomHash) && authReady;

  useSocketEvent("room_updated", updateRoom, { enabled });
  useSocketEvent("room_joined", ({ room }) => updateRoom(room), { enabled });

  useEffect(() => {
    if (!enabled || !isConnected) return;
    socket.emit("join_room", { roomHash });
  }, [socket, roomHash, enabled, isConnected]);
}
