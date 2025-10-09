import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useSocket } from "./socket.context";
import { RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";
import useRoomByHash, { RoomsInterface } from "@/hooks/rooms/useRoomByHash";



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
    if (!id) return;

    socket.on("room_update", (updatedRoom: RoomsInterface) => {
      updateRoom(updatedRoom);
    });

    return () => {
      socket.emit("quit");
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
