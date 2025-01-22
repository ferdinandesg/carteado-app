import { useGameContext } from "@/contexts/game.context";
import styles from "@styles/Table.module.scss";
import CardBunch from "./CardBunch";
import Opponent from "./Opponent/Opponent";
import classNames from "classnames";

export default function Table() {
  const { rotatedPlayers, bunchCards, retrieveCard } = useGameContext();

  const playerPositions = {
    1: ["bottom-center"],
    2: ["bottom-center", "top-center"],
    3: ["bottom-center", "top-left", "top-right"],
    4: ["bottom-left", "bottom-right", "top-left", "top-right"],
  }[rotatedPlayers.length] || ["bottom-center"];

  return (
    <div className={styles.table}>
      {rotatedPlayers.map((player, index) => (
        <div
          key={player.userId}
          className={classNames(styles.player, styles[playerPositions[index]])}>
          <Opponent player={player} />
        </div>
      ))}
      <CardBunch
        cards={bunchCards}
        onClick={retrieveCard}
      />
    </div>
  );
}
