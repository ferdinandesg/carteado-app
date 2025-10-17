import { useState } from "react";
import { useSocket } from "@//contexts/socket.context";
import classNames from "classnames";
import useRoomByHash from "@//hooks/rooms/useRoomByHash";
import { useParams } from "next/navigation";

import styles from "@/styles/Lobby.module.scss";
import { useTranslation } from "react-i18next";
import { PlayerStatus } from "shared/game";
import Participants from "../Players/participants";
import { useSession } from "next-auth/react";

export default function Lobby() {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const { id } = useParams();
  const { data } = useSession();
  const roomId = String(id);
  const { room } = useRoomByHash(String(id));
  const isOwner = room?.ownerId === data?.user.id;

  const handleReadyClick = () => {
    if (!room) return;
    const newStatus = !isPlayerReady ? PlayerStatus.READY : PlayerStatus.NOT_READY;
    setIsPlayerReady((prev) => !prev);
    socket.emit("set_player_status", { status: newStatus });
  };

  const handleStartGame = () => {
    socket.emit("start_game", { roomId });
  };

  return (
    <div className={classNames(styles.LobbyContainer)}>
      <Participants roomHash={roomId} />
      <span className={classNames("animate-bounce", styles.waiting)}>
        {t("Lobby.waitingPlayers")}
      </span>
      <button
        className={classNames(
          styles.statusButton,
          isPlayerReady ? styles.ready : styles.notReady
        )}
        onClick={handleReadyClick}>
        {t("Lobby.imReady")}
      </button>
      {isOwner && <button
        className={styles.startGame}
        onClick={handleStartGame}>
        {t("Lobby.startGame")}
      </button>}
    </div>
  );
}
