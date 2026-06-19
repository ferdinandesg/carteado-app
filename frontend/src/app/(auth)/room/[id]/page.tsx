"use client";
import { useEffect, useState } from "react";
import Game from "@/components/Game/game";
import { useSocket } from "@/contexts/socket.context";
import { useRoomContext } from "@/contexts/room.context";
import Lobby from "@/components/Lobby";
import { RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";

import styles from "@/styles/Room.module.scss";
import Chat from "@/components/Chat";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";
import RoomInfo from "@/components/Players/roomInfo";
import RoomShell from "@/components/room/RoomShell";

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
  const [isChatCollapsed, setChatCollapsed] = useState(false);
  const [isInfoCollapsed, setInfoCollapsed] = useState(false);
  const toggleInfoCollapse = () => setInfoCollapsed((c) => !c);
  const toggleChatCollapse = () => setChatCollapsed((c) => !c);

  useEffect(() => {
    if (isLoading) return;
    socket.emit("join_room", { roomHash: id });
    return () => {
      socket.emit("quit", { roomHash: id });
    };
  }, [isLoading, socket, id]);

  if (isLoading) return <h1 className={styles.loadingState}>{t("loading")}</h1>;
  if (!room)
    return <h1 className={styles.loadingState}>{t("Room.notFound")}</h1>;

  return (
    <RoomShell
      isChatCollapsed={isChatCollapsed}
      isInfoCollapsed={isInfoCollapsed}
      chat={
        <Chat
          toggleCollapse={toggleChatCollapse}
          roomHash={room.hash}
          isCollapsed={isChatCollapsed}
        />
      }
      info={
        <RoomInfo
          toggleCollapse={toggleInfoCollapse}
          isCollapsed={isInfoCollapsed}
          room={room}
        />
      }>
      <RenderScreen status={room.status} />
    </RoomShell>
  );
}
