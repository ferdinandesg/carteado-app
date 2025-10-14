import { selectCurrentPlayer, useGameStore } from "@/contexts/game.store";
import ChoosingPhase from "./ChoosingPhase";
import PlayingPhase from "./PlayingPhase";


const GamePhaseManager = () => {
    const player = useGameStore(selectCurrentPlayer);

    if (player?.status === "choosing") {
        return <ChoosingPhase />;
    }

    return <PlayingPhase />;
};

export default function CarteadoGame() {

    return <GamePhaseManager />
}
