import CardComponent from "../Card";
import Table from "../Table";
import ModalChoseCards from "../Modal/ChoseCards/ModalChoseCards";
import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/Game.module.scss";
import CardFan from "../CardFan";
import TableActions from "../TableActions";

export default function Game() {
  const {
    player,
    playCard
  } = useGameContext();
  const handCards = player?.hand || [];
  const tableCards = player?.table.sort((a, b) => a.hidden ? 1 : -1) || [];
  return (
    <>
      <ModalChoseCards
        isOpen={player?.status === "chosing"} />

      <div className={styles.Game}>
        <div className={styles.gameTable}>
          <Table />
        </div>
        <div className={styles.cardTable}>
          {tableCards.map((card) => (
            <CardComponent card={card} key={`player-table-${card.toString}`} />
          ))}
        </div>
        <CardFan cards={handCards} onClick={playCard} />
        <TableActions />
      </div>
    </>
  );
}
