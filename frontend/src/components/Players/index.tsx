"use client";
import classNames from "classnames";
import useRoomByHash, { RoomPlayer } from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";
import { useTranslation } from "react-i18next";
import { useGameContext } from "@/contexts/game.context";

const isPlayerReady = (player: RoomPlayer) => player.status === "READY";

export default function Players({ roomHash }: { roomHash: string }) {
  const { t } = useTranslation();
  const { room } = useRoomByHash(roomHash);
  const { game } = useGameContext();
  const players = room?.players || [];

  const getPlayerTeam = (player: RoomPlayer) => {
    if (!game) return null;
    console.log({
      teams: game.teams, player
    })
    return game.teams.find((team) => team.userIds.includes(player.id || ""));
  }

  return players.map((player, i) => {
    const isReady = isPlayerReady(player) || room?.status === "playing";
    const statusClass = isReady ? styles.ready : styles.notReady;
    const statusLabel = isReady ? t("Players.status.ready") : t("Players.status.notReady");
    const team = getPlayerTeam(player);
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
          <span>
            {team?.id}
          </span>
        </div>
      </div>
    );
  });
}
