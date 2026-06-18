import { useContext, createContext, ReactNode, useEffect } from "react";
import { useSocket } from "./socket.context";
import { RoomInterface } from "@/models/room";
import { useParams } from "next/navigation";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

type RoomContextProps = {
  room: RoomInterface | undefined;
  isLoading: boolean;
  updateRoom: (updatedRoom: RoomInterface) => void;
};
const RoomContext = createContext<RoomContextProps | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { socket } = useSocket();
  const roomHash = typeof id === "string" ? id : "";
  const { updateRoom, room, isLoading } = useRoomByHash(roomHash);

  useEffect(() => {
    if (!roomHash) return;
    socket.on("room_updated", updateRoom);

    return () => {
      socket.off("room_updated", updateRoom);
    };
  }, [roomHash, socket, updateRoom]);
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
