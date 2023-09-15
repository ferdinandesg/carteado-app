import { useSocket } from "@/contexts/socket.context";
import Players from "../Players";
import { useRoomContext } from "@/contexts/room.context";
import { useEffect } from "react";

export default function Lobby() {
  const { socket } = useSocket();
  const { roomId } = useRoomContext();

  const handleStartGame = () => {
    // socket!.emit("player_ready", { roomId });
    socket!.emit("start_game", { roomId });
  };

  return <div className="flex flex-col p-2">
    <span className="text-center mb-2 text-white animate-bounce font-semibold text-sm">
      Esperando jogadores...
    </span>
    <button className="p-2 bg-green-600 text-white font-semibold" onClick={handleStartGame}>
      Start Game
    </button>
    <Players />
  </div >
}
