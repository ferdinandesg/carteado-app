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

const RenderScreen = ({ status }: { status?: RoomStatus }) => {
  switch (status) {
    case "open":
      return <Lobby />;
    case "playing":
      return <Game />;
    default:
      <div>Loading...</div>;
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
    clickSrc: "/assets/sfx/button-click.mp3",
  }
);

const RoomActions = ({ onLeaveRoom }: { onLeaveRoom: () => void }) => {
  return (
    <div className={styles.roomActions}>
      <ActionButton
        onClick={onLeaveRoom}
        outline
        icon={<span>Sair</span>}
      />
    </div>
  );
};

export default function Room() {
  const router = useRouter();
  const { id } = useParams();
  const { socket } = useSocket();
  const { room, isLoading } = useRoomByHash(String(id));

  useEffect(() => {
    if (isLoading || !socket) return;
    socket.emit("join_room", { roomId: id });
  }, [isLoading, socket]);

  if (isLoading)
    return (
      <h1 className="text-white font-semibold text-center pt-5">
        Carregando a sala...
      </h1>
    );
  if (!room)
    return (
      <h1 className="text-white font-semibold text-center pt-5">
        Sala não encontrada
      </h1>
    );

  const onLeaveRoom = () => {
    // socket.emit("leave_room", { roomId: room.hash });
    router.push("/menu");
  };

  return (
    <div className={styles.roomContainer}>
      <div className={styles.playersHud}>
        <Players roomId={room.hash} />
        <Chat roomId={room.hash} />
        <RoomActions onLeaveRoom={onLeaveRoom} />
      </div>
      <RenderScreen status={room.status} />
    </div>
  );
}
