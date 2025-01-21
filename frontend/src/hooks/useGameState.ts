import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios";
import { GameState } from "shared/types";

async function fetchGameState(hash: string) {
  const response = await axiosInstance.get<GameState>(`/game/${hash}`);
  return response.data;
}

export default function useGameState(hash: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['game', hash],
    queryFn: async () => fetchGameState(hash),
    enabled: !!hash,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });

  const updateGame = (updatedGame: GameState) => {
    queryClient.setQueryData(['game', hash], updatedGame);
  }
  return {
    game: data,
    isLoading,
    updateGame
  }
}