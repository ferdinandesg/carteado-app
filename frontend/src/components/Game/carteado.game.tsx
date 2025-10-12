import { selectCurrentPlayer, useGameStore } from "@/contexts/game.store";
import ChoosingPhase from "./ChoosingPhase";
import PlayingPhase from "./PlayingPhase";


const GamePhaseManager = () => {
    const player = useGameStore(selectCurrentPlayer);
    console.log({
        player
    })
    if (player?.status === "choosing") {
        return <ChoosingPhase />;
    }

    return <PlayingPhase />;
};

export default function CarteadoGame() {

    return <GamePhaseManager />
}
