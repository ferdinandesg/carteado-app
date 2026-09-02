import Table from "../Table";
import CardFan from "../CardFan";
import CarteadoBunchArea from "./CarteadoBunchArea";
import CarteadoDeckArea from "./CarteadoDeckArea";
import GameTableActions from "./GameTableActions";
import { useGameActions } from "@/hooks/game/useGameActions";
import { usePlayerHand } from "@/hooks/game/usePlayerHand";
import { useTypedGame } from "@/hooks/useTypedGame";
import { testIds } from "@/tests/testIds";
import { isCarteadoGame } from "shared/game";

export default function CarteadoTable() {
  const game = useTypedGame(isCarteadoGame);
  const { playCard } = useGameActions();
  const handCards = usePlayerHand();

  return (
    <Table
      game={game}
      deckArea={<CarteadoDeckArea />}
      centerArea={<CarteadoBunchArea />}
      actionsArea={<GameTableActions />}
      handArea={
        <CardFan
          cards={handCards}
          onClick={playCard}
          testId={testIds.game.cardFan}
        />
      }
    />
  );
}
