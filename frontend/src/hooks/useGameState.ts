import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameState } from "shared/types";
import useAxiosAuth from "./useAuthAxios";

export default function useGameState(hash: string) {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["game", hash],
    queryFn: () => axiosAuth.get(`/game/${hash}`).then((res) => res.data),
    enabled: !!hash,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const updateGame = (updatedGame: GameState) => {
    queryClient.setQueryData(["game", hash], updatedGame);
  };
  return {
    game: data,
    isLoading,
    updateGame,
  };
}
