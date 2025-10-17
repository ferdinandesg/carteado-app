import { useQuery, useQueryClient } from "@/tanstack/react-query";
import { RoomStatus } from "@/models/room";
import { Participant } from "shared/types";
import useAxiosAuth from "../useAuthAxios";

export type RoomsInterface = {
  id: string;
  ownerId: string;
  hash: string;
  name: string;
  size: number;
  status: RoomStatus;
  createdAt: string;
  participants: Participant[];
  rule: "CarteadoGameRules" | "TrucoGameRules";
};

export default function useRoomByHash(hash: string) {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery<RoomsInterface>(
    {
      queryKey: ["room", hash],
      queryFn: () => axiosAuth.get(`/rooms/${hash}`).then((res) => res.data),
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
