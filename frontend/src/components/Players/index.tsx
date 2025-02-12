"use client";
import classNames from "classnames";
import useRoomByHash, { RoomPlayer } from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";
import { useTranslation } from "react-i18next";
import { useGameContext } from "@/contexts/game.context";
import Shaky from "../Shaky";
import HandsResults from "../HandsResults";
import { useSession } from "next-auth/react";

const isPlayerReady = (player: RoomPlayer) => player.status === "READY";

export default function Players({ roomHash }: { roomHash: string }) {
  const { t } = useTranslation();
  const { room } = useRoomByHash(roomHash);
  const { game } = useGameContext();
  const players = room?.players || [];
  const isRoomPlaying = room?.status === "playing";

  const getPlayerTeam = (player: RoomPlayer) => {
    if (!game) return null;
    return game.teams?.find((team) => team.userIds.includes(player.id || ""));
  }

  const actualRound = game?.rounds || 0;

  return players.map((player, i) => {
    const isReady = isPlayerReady(player) || room?.status === "playing";
    const isUserTurn = game?.playerTurn === player.id;
    const statusLabel = () => {
      if (isRoomPlaying) {
        return isUserTurn ? t("Players.status.yourTurn") : t("Players.status.waiting");
      }
      return isReady ? t("Players.status.ready") : t("Players.status.notReady");
    }

    const statusClass = () => {
      if (isRoomPlaying) {
        return isUserTurn ? styles.ready : styles.notReady;
      }
      return isReady ? styles.ready : styles.notReady;
    }

    const team = getPlayerTeam(player);
    const currentRoundHistory = game?.handsResults?.filter(r => r.round === actualRound);

    const finalHistory = currentRoundHistory?.length
      ? game?.handsResults?.filter(r => r.round === actualRound).filter(r => r.winnerTeamId === team?.id)
      : game?.handsResults?.filter(r => r.round === actualRound - 1).filter(r => r.winnerTeamId === team?.id);

    return (
      <div
        className={styles.Player}
        key={`player-pos-${i}`}>
        <div className={classNames(
          styles.avatar,
          statusClass()
        )}>
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
          <span className={classNames(styles.playerStatus, statusClass())}>
            {statusLabel()}
          </span>
          {team?.id &&
            <Shaky value={team?.score}>
              <span className={styles.teamInfo}>{team?.id} - {team?.score} - {team?.roundWins}</span>
            </Shaky>
          }
        </div>
        <div className={styles.history}>
          {finalHistory?.map((h, i) => <HandsResults key={`${h.winnerTeamId}-${i}`} cards={h.bunch} />)}
        </div>
      </div>
    );
  });
}
