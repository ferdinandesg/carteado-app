"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import BackButton from "@/components/buttons/BackButton";
import { useRoomContext } from "@/contexts/room.context";
import { useSocket } from "@/contexts/socket.context";
import { testIds } from "@/tests/testIds";

import ParticipantListItem from "./ParticipantListItem";
import styles from "@/styles/RoomParticipantsPanel.module.scss";
import { useGameStore } from "@/contexts/game.store";
import { Participant } from "shared/types";

export default function RoomParticipantsPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const { socket } = useSocket();
  const { room } = useRoomContext();
  const { game } = useGameStore();

  if (!room) return null;

  const leaveRoom = () => {
    socket.emit("quit", { roomHash: room.hash });
    router.push("/menu");
  };

  const resolvePlayer = (participant: Participant) => {
    return game?.players.find((p) => p.userId === participant.userId);
  };

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
        onClick={leaveRoom}
      />

      <ul
        className={styles.participantList}
        data-testid={testIds.room.participantsList}>
        {room.participants.map((participant) => (
          <ParticipantListItem
            key={participant.userId}
            player={resolvePlayer(participant)}
            participant={participant}
          />
        ))}
      </ul>
    </aside>
  );
}
