"use client";
import { GameContext } from "@/contexts/game.context";
import {
  TextareaHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import UserCard from "@/components/UserCard";
import { SocketContext } from "@/contexts/socket.context";
import Game from "@/components/Game/game";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import Chat from "@/components/Chat";

const getRoom = async (hash: string) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/rooms/join/${hash}`,
      { method: "POST" }
    );
    const room = await response.json();
    return room;
  } catch (error) {
    console.log({ error });
  }
};

export default function Room() {
  const { isLoading } = useContext(GameContext)!;
  const params = useParams();
  const [roomId, setRoomId] = useState<string>('');
  const { socket } = useContext(SocketContext)!;
  useEffect(() => {
    setRoomId(String(params.id));
  }, [params.id]);

  useEffect(() => {
    socket?.on("user_joined", (message) => toast(message));

    socket?.emit("join_room", roomId);
    socket?.on("error", (user) => console.log("error", user));
  }, [socket]);

  if (!socket) return <div>Loading...</div>;
  return (
    <>
      {!isLoading ?? <Game />}
      <UserCard />

      <Chat roomId={roomId} />
    </>
  );
}
