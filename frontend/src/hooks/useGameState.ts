import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios";
import { GameState } from "@/@types/game";

export default function useGameState(hash: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['game', hash],
    queryFn: async () => {
      const response = await axiosInstance.get<GameState>(`/game/${hash}`);
      return response.data;
    },
    enabled: !!hash,
  });

  return {
    game: data,
    isLoading
  }
}