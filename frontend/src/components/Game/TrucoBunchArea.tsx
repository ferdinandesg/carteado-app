import GameBunchArea from "@/components/Game/GameBunchArea";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isTrucoGame } from "shared/game";

export default function TrucoBunchArea() {
  const game = useTypedGame(isTrucoGame);

  if (!game) return null;

  return (
    <GameBunchArea
      cards={game.bunch ?? []}
      canHover
    />
  );
}
