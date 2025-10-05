import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { Participant } from "shared/types";
import { UserSession } from "@/models/Users";

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

const rawFetchRooms = async () => {
  const response = await axiosInstance.get("/rooms");
  return response.data;
};

export default function useFetchRooms() {
  const { data, isLoading, isError } = useQuery<RoomInterface[]>({
    queryKey: ["rooms"],
    queryFn: rawFetchRooms,
  });
  return {
    data: data || [],
    isLoading,
    isError,
  };
}
