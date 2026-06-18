import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { RoomInterface } from "@/models/room";
import useAxiosAuth, { useAuthQueryEnabled } from "../useAuthAxios";

export default function useFetchRooms() {
  const { status: sessionStatus } = useSession();
  const axiosAuth = useAxiosAuth();
  const authReady = useAuthQueryEnabled();
  const { data, isLoading, isError, isFetching } = useQuery<RoomInterface[]>({
    queryKey: ["rooms"],
    queryFn: () => axiosAuth.get("/rooms").then((res) => res.data),
    enabled: authReady,
  });
  return {
    data: data || [],
    isLoading:
      sessionStatus === "loading" || (authReady && (isLoading || isFetching)),
    isError,
  };
}
