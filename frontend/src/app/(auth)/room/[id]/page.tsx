"use client";
import { useEffect } from "react";
import Game from "@/components/Game/game";
import { useSocket } from "@/contexts/socket.context";
import { useRoomContext } from "@/contexts/room.context";
import Lobby from "@/components/Lobby";
import { RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";

import styles from "@/styles/Room.module.scss";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";
import RoomInfo from "@/components/Players/roomInfo";
import RoomShell from "@/components/room/RoomShell";
import { testIds } from "@/tests/testIds";
import RoomParticipantsPanel from "@/components/room/RoomParticipantsPanel";
import classNames from "classnames";

const RenderScreen = ({ status }: { status?: RoomStatus }) => {
  const { t } = useTranslation();
  switch (status) {
    case "open":
      return <Lobby />;
    case "playing":
    case "finished":
      return <Game />;
    default:
      return <div>{t("loading")}</div>;
  }
};

export default function Room() {
  const { t } = useTranslation();
  const { id } = useParams();
  useTitle({
    title: t("pageTitles.lobby", {
      hash: String(id),
    }),
  });
  const { socket } = useSocket();
  const { room, isLoading } = useRoomContext();

  useEffect(() => {
    if (isLoading) return;
    socket.emit("join_room", { roomHash: id });
    return () => {
      socket.emit("quit", { roomHash: id });
    };
  }, [isLoading, socket, id]);

  if (isLoading) {
    return (
      <h1
        className={styles.loadingState}
        data-testid={testIds.room.loading}>
        {t("loading")}
      </h1>
    );
  }
  if (!room)
    return <h1 className={styles.loadingState}>{t("Room.notFound")}</h1>;

  return (
    <RoomShell
      participants={<RoomParticipantsPanel />}
      info={<RoomInfo room={room} />}>
      <div
        className={classNames(styles.roomStageContent, {
          [styles.roomStageGame]: room.status !== "open",
        })}
        data-testid={testIds.room.stage}>
        <RenderScreen status={room.status} />
      </div>
    </RoomShell>
  );
}
