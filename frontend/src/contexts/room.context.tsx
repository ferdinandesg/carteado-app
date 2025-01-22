import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useSocket } from "./socket.context";
import { RoomInterface, RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";
import useRoomByHash, { RoomPlayer } from "@/hooks/rooms/useRoomByHash";

type UpdateRoomType = {
  room: RoomInterface;
  players: RoomPlayer[];
};

type RoomContextProps = {
  name: string;
  status: RoomStatus;
};
const RoomContext = createContext<RoomContextProps | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { socket } = useSocket();
  const [name] = useState<string>("");
  const { updateRoom, room } = useRoomByHash(id as string);

  useEffect(() => {
    if (!id || !socket) return;
    socket.on("room_update", (updatedRoom: UpdateRoomType) => {
      updateRoom({
        ...updatedRoom.room,
        players: updatedRoom.players,
      });
    });

    return () => {
      socket.off("room_update");
    };
  }, [id, socket]);
  return (
    <RoomContext.Provider
      value={{
        name,
        status: room?.status || "open",
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
