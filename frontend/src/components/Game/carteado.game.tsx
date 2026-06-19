import { useCurrentPlayer } from "@/hooks/game/useCurrentPlayer";
import ChoosingPhase from "./ChoosingPhase";
import PlayingPhase from "./PlayingPhase";

const GamePhaseManager = () => {
  const player = useCurrentPlayer();

  if (player?.status === "choosing") {
    return <ChoosingPhase />;
  }

  return <PlayingPhase />;
};

export default function CarteadoGame() {
  return <GamePhaseManager />;
}
