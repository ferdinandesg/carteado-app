import classNames from "classnames";
import Image from "next/image";
import { BasePlayer } from "shared/game";

import UserPlaceholder from "../UserPlaceholder";
import styles from "@/styles/Opponent.module.scss";

type OpponentProps = {
  player: BasePlayer;
  isCurrentPlayerTurn?: boolean;
};

export default function Opponent({
  player,
  isCurrentPlayerTurn = false,
}: OpponentProps) {
  return (
    <div className={styles.Opponent}>
      <div
        className={classNames(styles.avatarFrame, {
          [styles.isTurn]: isCurrentPlayerTurn,
        })}>
        {player.image ? (
          <Image
            className={styles.avatar}
            src={player.image}
            alt={player.name || "opponent avatar"}
            width={82}
            height={82}
          />
        ) : (
          <UserPlaceholder />
        )}
        <span className={styles.cardCount}>{player.hand.length}</span>
      </div>
      <span className={styles.name}>{player.name}</span>
    </div>
  );
}
