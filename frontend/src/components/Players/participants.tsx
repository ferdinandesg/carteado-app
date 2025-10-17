"use client";
import classNames from "classnames";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Participants.module.scss";
import UserPlaceholder from "../UserPlaceholder";
import Image from "next/image";
import RankMeter from "../RankMeter";
import { useTranslation } from "react-i18next";
import { PlayerStatus } from "shared/game";
import { Crown } from "lucide-react";


export default function Participants({ roomHash }: { roomHash: string }) {
  const { t } = useTranslation();
  const { room } = useRoomByHash(roomHash);

  return room?.participants.map((participant, i) => {
    const isReady = participant.status === PlayerStatus.READY;
    const isOwner = room.ownerId === participant.userId;

    return (
      <div
        className={styles.participant}
        key={`player-pos-${i}`}>
        <div className={classNames(
          styles.avatar,
          isReady ? styles.yourTurn : styles.waiting
        )}>
          {participant?.image ? (
            <Image
              alt={participant.name || ""}
              src={participant.image}
              objectFit="contain"
              width={100}
              height={100}
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>
        <div className={styles.metadata}>
          <span className={styles.username}>{participant.name}
            {isOwner && <Crown />}
          </span>
          <RankMeter
            currentValue={0}
            size={25}
          />
          <span className={classNames(styles.playerStatus, isReady ? styles.ready : styles.notReady)}>
            {isReady ? t("Participants.status.ready") : t("Participants.status.notReady")}
          </span>
        </div>
      </div>
    );
  });
}
