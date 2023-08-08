'use client'

import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";

export default function Menu() {
  const router = useRouter()
  const { data } = useSession();
  const user = data?.user;
  const createRoom = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/rooms", { headers: { "Content-Type": "application/json", }, method: "POST", body: JSON.stringify({ name: "Sala dos cria", createdBy: user?.name }) })
      const room = await response.json()
      router.push(`/room/${room.hash}`)
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col h-1/2 w-1/2 gap-2 bg-[#496493]">
        <button className="p-2 bg-gray-400 hover:bg-gray-500 " onClick={() => createRoom()}>Start game</button>
        <button className="p-2 bg-gray-400 hover:bg-gray-500 ">Join game</button>
      </div>
    </div>
  );
}
