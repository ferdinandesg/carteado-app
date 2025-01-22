import { Player } from "shared/types";

import UserPlaceholder from "../UserPlaceholder";

import styles from "@styles/Opponent.module.scss";
import { useState } from "react";
import CardFan from "../CardFan";
import { useGameContext } from "@/contexts/game.context";
import classNames from "classnames";

export default function Opponent({ player }: { player: Player }) {
  const { game } = useGameContext();
  const isCurrentPlayerTurn = game?.playerTurn === player.userId;
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const opponentCards = player.table.sort((a, b) => (a.hidden ? 1 : -1));

  return (
    <div
      className={classNames(
        styles.Opponent,
        isCurrentPlayerTurn && styles.isCurrentPlayerTurn
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {player.image ? (
        <img
          src={player.image}
          alt={player.name}
          className={styles.avatar}
        />
      ) : (
        <UserPlaceholder />
      )}
      <p className={styles.name}>
        {player.name} ({player.hand.length})
      </p>
      {isHovered && (
        <div className={styles.infoBox}>
          <p>Cartas na mão: {player.hand.length}</p>
          <p>Cartas na mesa:</p>
          <CardFan cards={opponentCards} />
        </div>
      )}
    </div>
  );
}
