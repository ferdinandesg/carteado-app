import Table from "../Table";
import CarteadoBunchArea from "./CarteadoBunchArea";
import CarteadoDeckArea from "./CarteadoDeckArea";
import GameTableActions from "./GameTableActions";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isCarteadoGame } from "shared/game";

export default function CarteadoTable() {
  const game = useTypedGame(isCarteadoGame);

  return (
    <Table
      game={game}
      deckArea={null}
      playedCardsArea={<CarteadoBunchArea />}
      actionsAreaLeft={<CarteadoDeckArea />}
      actionsAreaRight={<GameTableActions />}
    />
  );
}
