"use client";
import { useEffect } from "react";
import Game from "@/components/Game/game";
import { useSocket } from "@/contexts/socket.context";
import Lobby from "@/components/Lobby";
import { RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import Players from "@/components/Players";

const RenderScreen = ({ status }: { status?: RoomStatus }) => {
  switch (status) {
    case "open":
      return <Lobby />;
    case "playing":
      return <Game />;
    default:
      <div>Loading...</div>;
  }
};

export default function Room() {
  const { id } = useParams();
  const { socket } = useSocket();
  const { room, isLoading } = useRoomByHash(String(id));

  useEffect(() => {
    if (isLoading || !socket) return;
    socket.emit("join_room", { roomId: id });
  }, [isLoading, socket]);

  if (isLoading)
    return (
      <h1 className="text-white font-semibold text-center pt-5">
        Carregando a sala...
      </h1>
    );
  if (!room)
    return (
      <h1 className="text-white font-semibold text-center pt-5">
        Sala não encontrada
      </h1>
    );

  return (
    <div className={styles.roomContainer}>
      <div className={styles.playersHud}>
        <Players roomId={room.hash} />
      </div>
      <RenderScreen status={room.status} />
    </div>
  );
}
