import { useState } from "react";
import { useSocket } from "@/contexts/socket.context";
import { useRoomContext } from "@/contexts/room.context";
import classNames from "classnames";

import styles from "@/styles/Lobby.module.scss";
import { useTranslation } from "react-i18next";
import { PlayerStatus } from "shared/game";
import Participants from "../Players/participants";
import { useSession } from "next-auth/react";
import ActionButton from "@/components/buttons/ActionButton";
import { Play, UserCheck } from "lucide-react";

export default function Lobby() {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const { data } = useSession();
  const { room } = useRoomContext();
  const isOwner = room?.ownerId === data?.user.id;

  const handleReadyClick = () => {
    if (!room) return;
    const newStatus = !isPlayerReady
      ? PlayerStatus.READY
      : PlayerStatus.NOT_READY;
    setIsPlayerReady((prev) => !prev);
    socket.emit("set_player_status", { status: newStatus });
  };

  const handleStartGame = () => {
    socket.emit("start_game");
  };

  return (
    <div className={classNames(styles.LobbyContainer)}>
      <Participants />
      <span className={classNames("animate-bounce", styles.waiting)}>
        {t("Lobby.waitingPlayers")}
      </span>
      <ActionButton
        type="button"
        variant={isPlayerReady ? "secondary" : "primary"}
        size="lg"
        icon={<UserCheck size={24} />}
        className={classNames(
          styles.statusButton,
          isPlayerReady ? styles.ready : styles.notReady
        )}
        onClick={handleReadyClick}>
        {t("Lobby.imReady")}
      </ActionButton>
      {isOwner && (
        <ActionButton
          type="button"
          variant="accent"
          size="lg"
          icon={<Play size={24} />}
          className={styles.startGame}
          onClick={handleStartGame}>
          {t("Lobby.startGame")}
        </ActionButton>
      )}
    </div>
  );
}
