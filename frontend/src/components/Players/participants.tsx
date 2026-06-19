"use client";
import classNames from "classnames";
import { useRoomContext } from "@/contexts/room.context";

import styles from "@/styles/Participants.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";
import { useTranslation } from "react-i18next";
import { PlayerStatus } from "shared/game";
import { Crown } from "lucide-react";

export default function Participants() {
  const { t } = useTranslation();
  const { room } = useRoomContext();

  if (!room) return null;

  return (
    <div
      className={styles.participantsList}
      aria-label={t("RoomItem.participants")}>
      {room.participants.map((participant, i) => {
        const isReady = participant.status === PlayerStatus.READY;
        const isOwner = room.ownerId === participant.userId;

        return (
          <article
            className={classNames(
              styles.participant,
              isReady ? styles.readyCard : styles.waitingCard
            )}
            key={`player-pos-${i}`}>
            <div className={styles.avatar}>
              {participant?.image ? (
                <Image
                  alt={participant.name || ""}
                  src={participant.image}
                  width={80}
                  height={80}
                />
              ) : (
                <UserPlaceholder />
              )}
            </div>
            <div className={styles.metadata}>
              <span className={styles.username}>
                {participant.name}
                {isOwner && (
                  <Crown
                    size={18}
                    aria-label={t("RoomInfo.owner")}
                  />
                )}
              </span>
              <RankMeter
                currentValue={0}
                size={25}
              />
              <span
                className={classNames(
                  styles.playerStatus,
                  isReady ? styles.ready : styles.notReady
                )}>
                {isReady
                  ? t("Participants.status.ready")
                  : t("Participants.status.notReady")}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
