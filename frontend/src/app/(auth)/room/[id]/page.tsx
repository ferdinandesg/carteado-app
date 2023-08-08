"use client";
import { useContext, useEffect, useState } from "react";
import UserCard from "@/components/UserCard";
import Game from "@/components/Game/game";
import { useParams } from "next/navigation";
import Chat from "@/components/Chat";
import { useSession } from "next-auth/react";
import { Player } from "@/models/Users";
import Players from "@/components/Players";
import { useSocket } from "@/contexts/socket.context";
type User = {
  email: string;
  name: string;
  id: string;
  image: string;
};
type PayloadType = {
  message: string;
  user: User;
};
interface RoomProps {
  params: {
    id: string;
  };
}

const getRoomByHash = async (hash: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/rooms/hash${hash}`);
    const room = response.json();
    return room;
  } catch (error) {
    throw error;
  }
};

export default function Room({ params }: RoomProps) {
  const { socket } = useSocket();
  const roomId = params.id;

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_room", { roomId });
  }, [socket]);
  if (!socket) return <div>Loading...</div>;

  const handleStartGame = () => {
    socket.emit("start_game", { roomId });
  };
  return (
    <>
      <Game />
      <button className="p-2" onClick={() => handleStartGame()}>
        Start Game
      </button>
      <div className="w-1/2 flex flex-col">
        <Players />
        <Chat roomId={roomId} />
        <UserCard />
      </div>
    </>
  );
}
