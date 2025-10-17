import { useQuery } from "@tanstack/react-query";
import { Participant } from "shared/types";
import { UserSession } from "@/models/Users";
import useAxiosAuth from "../useAuthAxios";

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
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isError } = useQuery<RoomInterface[]>({
    queryKey: ["rooms"],
    queryFn: () => axiosAuth.get("/rooms").then((res) => res.data),
  });
  return {
    data: data || [],
    isLoading,
    isError,
  };
}
