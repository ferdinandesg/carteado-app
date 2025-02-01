import { Player } from "shared/types";

import UserPlaceholder from "../UserPlaceholder";

import styles from "@styles/Opponent.module.scss";
import { useState } from "react";
import CardFan from "../CardFan";
import { useGameContext } from "@/contexts/game.context";
import classNames from "classnames";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Opponent({ player }: { player: Player }) {
  const { data } = useSession()
  const userId = data?.user?.id
  const { game } = useGameContext();
  const isCurrentPlayerTurn = game?.playerTurn === player.userId;
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const opponentCards = player.table.sort((a) => (a.hidden ? 1 : -1));
  const isSamePlayer = userId === player.userId;

  return (
    <div
      className={classNames(
        styles.Opponent,
        isCurrentPlayerTurn && styles.isCurrentPlayerTurn
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {player.image ? (
        <Image
          src={player.image}
          alt={player.name || "opponent avatar"}
          width={150}
          height={100}
        />
      ) : (
        <UserPlaceholder />
      )}
      <p className={styles.name}>
        {player.name} ({player.hand.length})
      </p>
      {isHovered && !isSamePlayer && (
        <div className={styles.infoBox}>
          <p>Cartas na mão: {player.hand.length}</p>
          <p>Cartas na mesa:</p>
          <CardFan cards={opponentCards} />
        </div>
      )}
    </div>
  );
}
