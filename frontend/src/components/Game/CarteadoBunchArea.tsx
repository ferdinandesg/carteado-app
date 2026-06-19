import GameBunchArea from "@/components/Game/GameBunchArea";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isCarteadoGame } from "shared/game";

export default function CarteadoBunchArea() {
  const game = useTypedGame(isCarteadoGame);

  if (!game) return null;

  return (
    <GameBunchArea
      cards={game.bunch ?? []}
      canHover
    />
  );
}
