"use client";

import classNames from "classnames";
import { Crown, Layers } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import UserPlaceholder from "@/components/UserPlaceholder";
import { type ParticipantView } from "@/lib/room/participantDisplayStatus";

import styles from "@/styles/RoomParticipantsPanel.module.scss";

type ParticipantListItemProps = {
  view: ParticipantView;
};

export default function ParticipantListItem({
  view,
}: ParticipantListItemProps) {
  const { t } = useTranslation();
  const {
    participant,
    badge,
    isMe,
    isOwner,
    isGuest,
    isTurn,
    handCount,
    team,
  } = view;

  const badgeText =
    isTurn && isMe
      ? t("Participants.status.yourTurn")
      : t(`Participants.badge.${badge}`);

  return (
    <li
      className={classNames(styles.participantItem, {
        [styles.isMe]: isMe,
        [styles.isTurn]: isTurn,
        [styles.away]: badge === "away",
        [styles.ally]: team === "ally",
        [styles.rival]: team === "rival",
      })}
      data-user-id={participant.userId}>
      <div className={styles.avatar}>
        {participant.image ? (
          <Image
            alt={participant.name}
            src={participant.image}
            width={56}
            height={56}
          />
        ) : (
          <UserPlaceholder />
        )}
        {handCount !== null && (
          <span
            className={styles.handCount}
            aria-label={t("Participants.cards", { count: handCount })}>
            <Layers
              size={11}
              aria-hidden
            />
            {handCount}
          </span>
        )}
      </div>

      <div className={styles.participantMeta}>
        <span
          className={styles.participantName}
          title={participant.name}>
          {isOwner && (
            <Crown
              className={styles.ownerIcon}
              size={14}
              aria-label={t("RoomInfo.owner")}
            />
          )}
          <span className={styles.nameText}>{participant.name}</span>
          {isGuest && (
            <span className={styles.guestTag}>{t("Participants.guest")}</span>
          )}
        </span>

        <span
          className={classNames(styles.statusBadge, styles[badge], {
            [styles.turn]: isTurn,
          })}>
          {badgeText}
        </span>
      </div>
    </li>
  );
}
