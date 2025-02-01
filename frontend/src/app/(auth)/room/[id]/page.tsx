"use client";
import { useEffect } from "react";
import Game from "@/components/Game/game";
import { useSocket } from "@/contexts/socket.context";
import Lobby from "@/components/Lobby";
import { RoomStatus } from "@/models/room";
import { useParams, useRouter } from "next/navigation";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

import styles from "@styles/Room.module.scss";
import Players from "@/components/Players";
import Chat from "@/components/Chat";
import classNames from "classnames";
import { withSound } from "@/components/buttons/withSound";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";

const RenderScreen = ({ status }: { status?: RoomStatus }) => {
  const { t } = useTranslation();
  switch (status) {
    case "open":
      return <Lobby />;
    case "playing":
      return <Game />;
    default:
      <div>{t("loading")}</div>;
  }
};

const ActionButton = withSound(
  ({
    icon,
    outline,
    onClick,
  }: {
    icon: React.ReactNode;
    outline?: boolean;
    onClick?: () => void;
  }) => {
    return (
      <button
        onClick={onClick}
        className={classNames(styles.actionButton, outline && styles.outline)}>
        {icon}
      </button>
    );
  },
  {
    clickSrc: "/assets/sfx/button-hover.mp3",
  }
);

const RoomActions = ({ onLeaveRoom }: { onLeaveRoom: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.roomActions}>
      <ActionButton
        onClick={onLeaveRoom}
        outline
        icon={<span>{t("Room.leave")}</span>}
      />
    </div>
  );
};

export default function Room() {
  const { t } = useTranslation()
  const { id } = useParams();
  useTitle({
    title: t("pageTitles.lobby", {
      hash: String(id)
    })
  });
  const router = useRouter();
  const { socket } = useSocket();
  const { room, isLoading } = useRoomByHash(String(id));

  useEffect(() => {
    if (isLoading || !socket) return;
    socket.emit("join_room", { roomHash: id });
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

  const onLeaveRoom = () => {
    // socket.emit("leave_room", { roomHash: room.hash });
    router.push("/menu");
  };

  return (
    <div className={styles.roomContainer}>
      <div className={styles.playersHud}>
        <Players roomHash={room.hash} />
        <Chat roomHash={room.hash} />
        <RoomActions onLeaveRoom={onLeaveRoom} />
      </div>
      <RenderScreen status={room.status} />
    </div>
  );
}
