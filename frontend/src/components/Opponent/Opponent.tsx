import classNames from "classnames";
import Image from "next/image";
import { BasePlayer } from "shared/game";

import { type TeamRelation } from "@/lib/game/teamRelation";
import UserPlaceholder from "../UserPlaceholder";
import styles from "@/styles/Opponent.module.scss";

export type { TeamRelation };

type OpponentProps = {
  player: BasePlayer;
  isCurrentPlayerTurn?: boolean;
  /** Colore a moldura conforme o time em relação ao jogador local. */
  team?: TeamRelation;
  /** Versão reduzida (chip) usada no assento do jogador local. */
  compact?: boolean;
  /** Destaque pulsante (ex.: time que precisa responder ao truco). */
  highlighted?: boolean;
  className?: string;
};

export default function Opponent({
  player,
  isCurrentPlayerTurn = false,
  team = null,
  compact = false,
  highlighted = false,
  className,
}: OpponentProps) {
  return (
    <div
      className={classNames(styles.Opponent, className, {
        [styles.compact]: compact,
        [styles.ally]: team === "ally",
        [styles.rival]: team === "rival",
        [styles.highlighted]: highlighted,
      })}
      data-user-id={player.userId}>
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
