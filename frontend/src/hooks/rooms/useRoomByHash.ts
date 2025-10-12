import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { RoomStatus } from "@/models/room";
import { Participant } from "shared/types";

export type RoomsInterface = {
  id: string;
  hash: string;
  name: string;
  size: number;
  status: RoomStatus;
  createdAt: string;
  participants: Participant[];
  rule: "CarteadoGameRules" | "TrucoGameRules";
};
const fetchRoomByHash = async (hash: string) => {
  const response = await axiosInstance.get(`/rooms/${hash}`);
  return response.data;
};
export default function useRoomByHash(hash: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery<RoomsInterface>(
    {
      queryKey: ["room", hash],
      queryFn: () => fetchRoomByHash(hash),
      enabled: !!hash,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    }
  );
  const updateRoom = (updatedRoom: RoomsInterface) => {
    queryClient.setQueryData(["room", hash], updatedRoom);
  };
  return {
    room: data,
    isLoading,
    isError,
    error,
    refetch,
    updateRoom,
  };
}
