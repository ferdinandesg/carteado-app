import CardComponent from "../Card";
import Table from "../Table";
import ModalChoseCards from "../Modal/ChoseCards/ModalChoseCards";
import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/Game.module.scss";
import CardFan from "../CardFan";

export default function Game() {
  const { player, playCard } = useGameContext();
  const handCards = player?.hand || [];
  const tableCards = player?.table.sort((a) => (a.hidden ? 1 : -1)) || [];

  const isPlayerChoosing = player?.status === "chosing";

  return (
    <>
      <ModalChoseCards isOpen={isPlayerChoosing} />
      <div className={styles.Game}>
        <div className={styles.gameTable}>{!isPlayerChoosing && <Table />}</div>
        <CardFan
          cards={handCards}
          onClick={playCard}
        />
        <div className={styles.cardTable}>
          {tableCards.map((card) => (
            <CardComponent
              card={card}
              height={125}
              key={`player-table-${card.toString}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
