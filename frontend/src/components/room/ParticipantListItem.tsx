"use client";

import Image from "next/image";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Crown } from "lucide-react";
import { Participant } from "shared/types";

import RankMeter from "@/components/RankMeter";
import UserPlaceholder from "@/components/UserPlaceholder";
import { getParticipantBadgeStatus } from "@/lib/room/participantDisplayStatus";

import styles from "@/styles/RoomParticipantsPanel.module.scss";

type ParticipantListItemProps = {
  participant: Participant;
  isOwner?: boolean;
};

export default function ParticipantListItem({
  participant,
  isOwner = false,
}: ParticipantListItemProps) {
  const { t } = useTranslation();
  const badgeStatus = getParticipantBadgeStatus(participant);

  return (
    <li className={styles.participantItem}>
      <div className={styles.participantBody}>
        <div className={styles.participantMeta}>
          <span className={styles.participantName}>{participant.name}</span>
          <div className={styles.participantStatus}>
            <span
              className={classNames(styles.statusBadge, styles[badgeStatus])}
              aria-label={t(`Participants.badge.${badgeStatus}`)}>
              {t(`Participants.badge.${badgeStatus}`)}
            </span>
            <span className={styles.levelBadge}>
              {t("Participants.level", { level: 1 })}
            </span>
          </div>
          <RankMeter
            currentValue={12}
            size={18}
          />
        </div>

        <div className={styles.avatar}>
          {participant.image ? (
            <Image
              alt={participant.name}
              src={participant.image}
              width={72}
              height={72}
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>
      </div>
    </li>
  );
}
