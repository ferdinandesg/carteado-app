"use client";
import classNames from "classnames";
import UserCard from "../UserCard";
import useRoomByHash, { RoomPlayer } from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";

const isPlayerReady = (player: RoomPlayer) => player.status === "READY";

export default function Players({ roomId }: { roomId: string }) {
  const { room } = useRoomByHash(roomId);
  const players = room?.players || [];
  console.log(players);
  return players.map((player) => {
    const isReady = isPlayerReady(player);
    return (
      <div
        className={styles.Player}
        key={player.id}>
        <div
          className={classNames(
            styles.avatar,
            isReady ? styles.ready : styles.notReady
          )}>
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

          <span
            className={classNames(
              styles.playerStatus,
              isReady ? styles.ready : styles.notReady
            )}>
            {isReady ? "Pronto" : "Não pronto"}
          </span>
        </div>
      </div>
    );
  });
}
