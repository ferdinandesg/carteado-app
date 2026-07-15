import { useContext, createContext, ReactNode } from "react";
import { useParams } from "next/navigation";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import { useRoomSocket } from "@/hooks/rooms/useRoomSocket";
import { useAuthQueryEnabled } from "@/hooks/useAuthAxios";
import { useSocket } from "./socket.context";
import { RoomInterface } from "@/models/room";

type RoomContextProps = {
  room: RoomInterface | undefined;
  isLoading: boolean;
  updateRoom: (updatedRoom: RoomInterface) => void;
};

const RoomContext = createContext<RoomContextProps | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();

  const { socket, isConnected } = useSocket();
  const authReady = useAuthQueryEnabled();

  const roomHash = typeof id === "string" ? id : "";
  const { updateRoom, room, isLoading } = useRoomByHash(roomHash);

  useRoomSocket({
    roomHash,
    socket,
    isConnected,
    authReady,
    updateRoom,
  });

  return (
    <RoomContext.Provider
      value={{
        room,
        isLoading,
        updateRoom,
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
