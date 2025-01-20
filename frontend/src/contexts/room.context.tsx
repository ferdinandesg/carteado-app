import { useContext, createContext, ReactNode, useState, useEffect } from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import { RoomStatus } from "@/models/room";
import usePlayers from "../hooks/usePlayers";
import { Player } from "@/models/Users";
import { useParams } from "next/navigation";

type RoomContextProps = {
  name: string;
  roomId: string;
  status: RoomStatus;
  players: Player[];
}
const RoomContext = createContext<RoomContextProps | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { socket } = useSocket();
  const { players, setPlayers, refreshPlayer } = usePlayers();
  const [name] = useState<string>("")
  const [status, setStatus] = useState<RoomStatus>("open");

 


  return (
    <RoomContext.Provider value={{
      name,
      status,
      roomId: id as string,
      players
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context)
    throw new Error("useRoomContext must be used within a RoomContextProvider");
  return context;
}
