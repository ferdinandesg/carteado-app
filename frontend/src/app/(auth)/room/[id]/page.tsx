"use client";
import { GameContext } from "@/contexts/game.context";
import {
  useContext,
  useEffect,
  useState,
} from "react";
import UserCard from "@/components/UserCard";
import { SocketContext } from "@/contexts/socket.context";
import Game from "@/components/Game/game";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Chat from "@/components/Chat";

interface RoomProps {
  params: {
    id: string
  }
}
export default function Room({ params }: RoomProps) {
  const { isLoading } = useContext(GameContext)!;
  const { socket } = useContext(SocketContext)!;
  const roomId = params.id
  console.log(params);
  useEffect(() => {
    if (!socket) return
    socket.on("user_joined", (message) => toast(message));
    console.log({ roomId });

    socket.emit("join_room", { roomId });
  }, [socket]);

  if (!socket) return <div>Loading...</div>;
  return (
    <>
      {!isLoading ?? <Game />}
      <div className="w-1/2 flex flex-col">
        <UserCard />
        <Chat roomId={roomId} />
      </div>
    </>
  );
}
