"use client";
import classNames from "classnames";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";
import { useTranslation } from "react-i18next";
import Shaky from "../Shaky";
import HandsResults from "../HandsResults";
import { selectPlayers, useGameStore } from "@/contexts/game.store";
import { Player } from "shared/types";
import { PlayerStatus } from "shared/game";

const isPlayerReady = (player: Player) => player.status === PlayerStatus.READY;

export default function Players({ roomHash }: { roomHash: string }) {
  const { t } = useTranslation();
  const { room } = useRoomByHash(roomHash);
  const { game } = useGameStore();
  const players = useGameStore(selectPlayers);
  const isRoomPlaying = room?.status === "playing";

  const getPlayerTeam = (player: Player) => {
    if (!game) return null;
    return game.teams?.find((team) => team.userIds.includes(player.id || ""));
  }

  const actualRound = game?.rounds || 0;

  return players.map((player, i) => {
    const isReady = isPlayerReady(player) || room?.status === "playing";
    const isUserTurn = game?.playerTurn === player.id;
    const statusLabel = () => {
      if (isRoomPlaying) {
        return isUserTurn ? t("Participants.status.yourTurn") : t("Participants.status.waiting");
      }
      return isReady ? t("Participants.status.ready") : t("Participants.status.notReady");
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
              alt={player.name || ""}
              src={player.image}
              objectFit="contain"
              width={100}
              height={100}
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>
        <div className={styles.metadata}>
          <span className={styles.username}>{player.name}</span>
          <RankMeter
            currentValue={0}
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
