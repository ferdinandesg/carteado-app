"use client";
import classNames from "classnames";
import useRoomByHash, { RoomPlayer } from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";
import { useTranslation } from "react-i18next";

const isPlayerReady = (player: RoomPlayer) => player.status === "READY";

export default function Players({ roomHash }: { roomHash: string }) {
  const { t } = useTranslation();
  const { room } = useRoomByHash(roomHash);
  const players = room?.players || [];

  return players.map((player, i) => {
    const isReady = isPlayerReady(player) || room?.status === "playing";
    const statusClass = isReady ? styles.ready : styles.notReady;
    const statusLabel = isReady ? t("Players.status.ready") : t("Players.status.notReady");
    return (
      <div
        className={styles.Player}
        key={`player-pos-${i}`}>
        <div className={classNames(styles.avatar, statusClass)}>
          {player?.image ? (
            <Image
              alt={player.name}
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
            {statusLabel}
          </span>
        </div>
      </div>
    );
  });
}
