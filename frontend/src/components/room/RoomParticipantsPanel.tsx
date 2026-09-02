"use client";

import { useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import BackButton from "@/components/buttons/BackButton";
import { useGameStore } from "@/contexts/game.store";
import { useRoomContext } from "@/contexts/room.context";
import { useLeaveRoom } from "@/hooks/rooms/useLeaveRoom";
import { buildParticipantViews } from "@/lib/room/participantDisplayStatus";
import { testIds } from "@/tests/testIds";

import ParticipantListItem from "./ParticipantListItem";
import styles from "@/styles/RoomParticipantsPanel.module.scss";

export default function RoomParticipantsPanel() {
  const { t } = useTranslation();
  const { room } = useRoomContext();
  const game = useGameStore((state) => state.game);
  const userId = useGameStore((state) => state.userId);
  const leaveRoom = useLeaveRoom(room?.hash);

  const views = useMemo(
    () => (room ? buildParticipantViews(room, game, userId) : []),
    [room, game, userId]
  );

  if (!room) return null;

  return (
    <aside
      className={classNames(styles.panel, {
        // Em jogo, os assentos da mesa já mostram os jogadores: no mobile
        // o painel encolhe para só o header (voltar + contagem).
        [styles.inGame]: room.status !== "open",
      })}
      data-testid={testIds.room.participantsPanel}
      aria-label={t("RoomInfo.participants")}>
      <header className={styles.header}>
        <BackButton
          className={styles.backButton}
          data-testid={testIds.room.backButton}
          color="white"
          size={24}
          onClick={leaveRoom}
        />
        <span className={styles.count}>
          {views.length}/{room.size}
        </span>
      </header>

      <ul
        className={styles.participantList}
        data-testid={testIds.room.participantsList}>
        {views.map((view) => (
          <ParticipantListItem
            key={view.participant.userId}
            view={view}
          />
        ))}
      </ul>
    </aside>
  );
}
