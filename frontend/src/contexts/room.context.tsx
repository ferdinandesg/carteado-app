import { useContext, createContext, ReactNode, useMemo } from "react";
import { useParams } from "next/navigation";
import type { RoomInterface } from "shared/types";

import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import { useRoomSocket } from "@/hooks/rooms/useRoomSocket";
import { useAuthQueryEnabled } from "@/hooks/useAuthAxios";

type RoomContextProps = {
  room: RoomInterface | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  updateRoom: (updatedRoom: RoomInterface) => void;
};

const RoomContext = createContext<RoomContextProps | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const authReady = useAuthQueryEnabled();

  const roomHash = typeof id === "string" ? id : "";
  const { updateRoom, room, isLoading, isError, error } =
    useRoomByHash(roomHash);

  useRoomSocket({ roomHash, authReady, updateRoom });

  const value = useMemo<RoomContextProps>(
    () => ({ room, isLoading, isError, error, updateRoom }),
    [room, isLoading, isError, error, updateRoom]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context)
    throw new Error("useRoomContext must be used within a RoomContextProvider");
  return context;
}
