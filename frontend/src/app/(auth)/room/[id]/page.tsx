"use client";
import { useEffect } from "react";
import Game from "@/components/Game/game";
import { useSocket } from "@/contexts/socket.context";
import Lobby from "@/components/Lobby";
import { RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import Chat from "@/components/Chat";

const renderScreen = (status?: RoomStatus) => {
  switch (status) {
    case "open": return <Lobby />;
    case "playing": return <Game />;
    default: <div>Loading...</div>
  }
}

export default function Room() {
  const { id } = useParams();

  const { socket } = useSocket();
  const { room, isLoading, refetch } = useRoomByHash(String(id))

  useEffect(() => {
    if (!socket) return;
    socket.on("start_game", () => refetch());
    return () => {
      socket.off("start_game")
    }
  }, [socket])

  useEffect(() => {
    if (isLoading) return;
    socket!.emit("join_room", { roomId: id });
  }, [isLoading]);

  if (isLoading) return <h1 className="text-white font-semibold text-center pt-5">Carregando a sala...</h1>;
  if (!room) return <h1 className="text-white font-semibold text-center pt-5">Sala não encontrada</h1>;
  return (
    <>
      {renderScreen(room.status)}
      <Chat roomId={room.hash} />
    </>
  );
}
