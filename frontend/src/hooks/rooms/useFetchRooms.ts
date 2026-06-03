import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Participant } from "shared/types";
import { UserSession } from "@/models/Users";
import useAxiosAuth, { useAuthQueryEnabled } from "../useAuthAxios";

export type RoomInterface = {
  id: string;
  hash: string;
  name: string;
  size: number;
  status: "open" | "playing";
  owner?: UserSession;
  ownerId?: string;
  rule: "CarteadoGameRules" | "TrucoGameRules";
  createdAt: string;
  participants: Participant[];
};

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
