"use client";
import classNames from "classnames";
import useRoomByHash, { RoomPlayer } from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";

const isPlayerReady = (player: RoomPlayer) => player.status === "READY";

export default function Players({ roomHash }: { roomHash: string }) {
  const { room } = useRoomByHash(roomHash);
  const players = room?.players || [];
  console.log({ players });
  return players.map((player, i) => {
    const isReady = isPlayerReady(player);
    const statusClass = isReady ? styles.ready : styles.notReady;
    return (
      <div
        className={styles.Player}
        key={`player-pos-${i}`}>
        <div className={classNames(styles.avatar, statusClass)}>
          {player?.image ? (
            <Image
              alt="user.name"
              src={player.image}
              layout="fill"
              objectFit="contain"
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>
        <div className={styles.metadata}>
          <span className={styles.username}>{player.name}</span>
          <RankMeter
            currentValue={player.rank || 0}
            size={25}
          />
          <span className={classNames(styles.playerStatus, statusClass)}>
            {isReady ? "Pronto" : "Não pronto"}
          </span>
        </div>
      </div>
    );
  });
}
