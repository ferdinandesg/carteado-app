import { useGameContext } from "@/contexts/game.context";

export default function TableActions() {
  const {
    game,
    endTurn,
    drawTable
  } = useGameContext();
  const isGameStarted = game?.status === "playing";
  if (!isGameStarted) return
  return (
    <div className="flex justify-between w-1/4 mx-auto">
      <button
        className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
        onClick={drawTable}
      >
        Buy table cards
      </button>
      <button
        className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
        onClick={endTurn}
      >
        End Turn
      </button>
    </div>
  )
}