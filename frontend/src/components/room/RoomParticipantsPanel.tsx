"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import BackButton from "@/components/buttons/BackButton";
import { useRoomContext } from "@/contexts/room.context";
import { testIds } from "@/tests/testIds";

import ParticipantListItem from "./ParticipantListItem";
import styles from "@/styles/RoomParticipantsPanel.module.scss";

export default function RoomParticipantsPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const { room } = useRoomContext();

  if (!room) return null;

  return (
    <aside
      className={styles.panel}
      data-testid={testIds.room.participantsPanel}
      aria-label={t("RoomInfo.participants")}>
      <BackButton
        className={styles.backButton}
        data-testid={testIds.room.backButton}
        color="white"
        size={24}
        onClick={() => router.push("/menu")}
      />

      <ul
        className={styles.participantList}
        data-testid={testIds.room.participantsList}>
        {room.participants.map((participant) => (
          <ParticipantListItem
            key={participant.userId}
            participant={participant}
            isOwner={room.ownerId === participant.userId}
          />
        ))}
      </ul>
    </aside>
  );
}
