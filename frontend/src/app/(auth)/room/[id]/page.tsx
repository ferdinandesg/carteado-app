"use client";
import { useEffect, useState } from "react";
import Game from "@/components/Game/game";
import { useSocket } from "@/contexts/socket.context";
import Lobby from "@/components/Lobby";
import { RoomStatus } from "@/models/room";
import { useParams } from "next/navigation";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import Chat from "@/components/Chat";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";
import RoomInfo from "@/components/Players/roomInfo";

const RenderScreen = ({ status, roomHash }: { status?: RoomStatus, roomHash: string }) => {
  const { t } = useTranslation();
  switch (status) {
    case "open":
      return <Lobby />;
    case "playing":
    case "finished":
      return <Game roomHash={roomHash} />;
    default:
      <div>{t("loading")}</div>;
  }
};

export default function Room() {
  const { t } = useTranslation()
  const { id } = useParams();
  useTitle({
    title: t("pageTitles.lobby", {
      hash: String(id)
    })
  });
  const { socket } = useSocket();
  const { room, isLoading } = useRoomByHash(String(id));
  const [isChatCollapsed, setChatCollapsed] = useState(false);
  const [isInfoCollapsed, setInfoCollapsed] = useState(false);
  const toggleInfoCollapse = () => setInfoCollapsed((c) => !c);
  const toggleChatCollapse = () => setChatCollapsed((c) => !c);

  useEffect(() => {
    if (isLoading) return;
    console.log({
      socket
    })
    socket.emit("join_room", { roomHash: id });
    return () => {
      socket.emit("leave_room", { roomHash: id });
    };
  }, [isLoading, socket]);

  if (isLoading)
    return (
      <h1 className="text-white font-semibold text-center pt-5">
        {t("loading")}
      </h1>
    );
  if (!room)
    return (
      <h1 className="text-white font-semibold text-center pt-5">
        {t("Room.notFound")}
      </h1>
    );

  const lobbyContainerStyle = {
    '--chat-column-width': isChatCollapsed ? '40px' : '25%', // Mude de '1fr' para '25%'
    '--main-column-width': '1fr',                             // Mude de '2fr' para '1fr'
    '--info-column-width': isInfoCollapsed ? '40px' : '25%', // Mude de '1fr' para '25%'
  } as React.CSSProperties;

  return (
    <div className={styles.roomContainer} style={lobbyContainerStyle}>
      <Chat toggleCollapse={toggleChatCollapse} roomHash={room.hash} isCollapsed={isChatCollapsed} />
      <RenderScreen status={room.status} roomHash={room.hash} />
      <RoomInfo toggleCollapse={toggleInfoCollapse} isCollapsed={isInfoCollapsed} room={room} />

    </div>
  );
}
