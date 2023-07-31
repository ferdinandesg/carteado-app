"use client";
import { GameContext } from "@/contexts/game.context";
import { useContext, useEffect } from "react";
import UserCard from "@/components/UserCard";
import { SocketContext } from "@/contexts/socket.context";
import Game from "@/components/Game/game";
import { useParams } from 'next/navigation'

const getRoom = async (hash: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/rooms/join/${hash}`, { method: "POST" })
    const room = await response.json()
    return room
  } catch (error) {
    console.log({ error });
  }
}

export default function Room() {
  const {
    isLoading
  } = useContext(GameContext)!;
  const { socket } = useContext(SocketContext)!;
  const params = useParams()
  useEffect(() => {
    socket?.on("player_joined", (user) => console.log('entrou', user))
  }, [socket])
  getRoom(String(params.id)).then(x => console.log(x)).catch(er => console.log(er))
  if (!socket) return <div>Loading...</div>
  return (
    <>

      {!isLoading ?? <Game />}
      <UserCard />
    </>
  );
}
