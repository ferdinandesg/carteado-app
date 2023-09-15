"use client";
import { useEffect } from "react";
import Game from "@/components/Game/game";
import Players from "@/components/Players";
import { useSocket } from "@/contexts/socket.context";
import Lobby from "@/components/Lobby";
import { useGameContext } from "@/contexts/game.context";
import useFetch from "@/hooks/useFetch";
import { Player } from "@/models/Users";
import { Card } from "@/models/Cards";
import { RoomInterface, RoomStatus } from "@/models/room";
import { useRoomContext } from "@/contexts/room.context";
interface RoomProps {
  params: {
    id: string;
  };
}

const renderScreen = (status: RoomStatus) => {
  switch (status) {
    case "open": return <Lobby />;
    case "playing": return <Game />;
    default: <div>Loading...</div>
  }
}

export default function Room({ params }: RoomProps) {
  const roomId = params.id;
  const { socket } = useSocket();
  const { data, isLoading, error } = useFetch<RoomInterface>({ method: "GET", url: `${process.env.API_URL}/api/rooms/hash/${roomId}` })
  const { initRoom, status } = useRoomContext();

  useEffect(() => {
    if (isLoading) return;
    initRoom(data!);
    socket!.emit("join_room", { roomId });
  }, [isLoading]);

  if (isLoading) return <h1 className="text-white font-semibold text-center pt-5">Carregando a sala...</h1>;

  return (
    <>
      {renderScreen(status)}
    </>
  );
}
