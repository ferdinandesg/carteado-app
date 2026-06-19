import { useGameStore } from "@/contexts/game.store";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isTrucoGame } from "shared/game";

export function useTrucoActionsState() {
  const userId = useGameStore((state) => state.userId);
  const game = useTypedGame(isTrucoGame);

  const myTeam = game?.teams.find((team) =>
    team.userIds.includes(userId ?? "-")
  );

  const isTrucoPending = game?.trucoState === "PENDING";
  const isTrucoAskedByMyTeam = Boolean(
    game?.trucoAskerId && myTeam?.userIds.includes(game.trucoAskerId)
  );

  return {
    canAcceptReject: isTrucoPending && !isTrucoAskedByMyTeam,
    canAskTruco: !isTrucoPending && !isTrucoAskedByMyTeam,
  };
}
