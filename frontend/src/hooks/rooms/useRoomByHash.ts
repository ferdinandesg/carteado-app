import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RoomInterface } from "@/models/room";
import useAxiosAuth, { useAuthQueryEnabled } from "../useAuthAxios";

export default function useRoomByHash(hash: string) {
  const axiosAuth = useAxiosAuth();
  const authReady = useAuthQueryEnabled();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery<RoomInterface>({
    queryKey: ["room", hash],
    queryFn: () => axiosAuth.get(`/rooms/${hash}`).then((res) => res.data),
    enabled: !!hash && authReady,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
  const updateRoom = useCallback(
    (updatedRoom: RoomInterface) => {
      queryClient.setQueryData(["room", hash], updatedRoom);
    },
    [hash, queryClient]
  );
  return {
    room: data,
    isLoading,
    isError,
    error,
    refetch,
    updateRoom,
  };
}
