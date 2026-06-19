import GameBunchArea from "@/components/Game/GameBunchArea";
import { getTrucoHandResultCards } from "@/lib/game/trucoHandResults";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isTrucoGame } from "shared/game";

export default function TrucoHandResultsArea() {
  const game = useTypedGame(isTrucoGame);

  if (!game) return null;

  const cards = getTrucoHandResultCards(game.handsResults, game.rounds);

  return (
    <GameBunchArea
      cards={cards}
      direction="right"
    />
  );
}
