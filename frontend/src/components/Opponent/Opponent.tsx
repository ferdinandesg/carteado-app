
import UserPlaceholder from "../UserPlaceholder";
import styles from "@/styles/Opponent.module.scss";
import classNames from "classnames";
import Image from "next/image";
import { BasePlayer } from "shared/game";

export default function Opponent({ player, isCurrentPlayerTurn }: { player: BasePlayer, isCurrentPlayerTurn?: boolean }) {

  return (
    <div
      className={styles.Opponent}>
      {player.image ? (
        <Image
          className={classNames(styles.avatar, { [styles.isTurn]: isCurrentPlayerTurn })}
          src={player.image}
          alt={player.name || "opponent avatar"}
          width={100}
          height={100}
        />
      ) : (
        <UserPlaceholder />
      )}
      <span className={styles.name}>
        {player.name} ({player.hand.length})
      </span>
    </div>
  );
}
