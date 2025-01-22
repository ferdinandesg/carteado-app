import { useState } from "react";
import { useSocket } from "@/contexts/socket.context";
import Players from "../Players";
import classNames from "classnames";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import { useParams } from "next/navigation";

import styles from "@styles/Lobby.module.scss";

export default function Lobby() {
  const { socket } = useSocket();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const { id } = useParams();
  const roomId = String(id);
  const { room } = useRoomByHash(String(id));

  const handleReadyClick = () => {
    if (!socket || !room) return;
    const newStatus = !isPlayerReady ? "READY" : "NOT_READY";
    setIsPlayerReady((prev) => !prev);
    socket.emit("set_player_status", { status: newStatus });
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit("start_game", { roomId });
  };

  return (
    <div className={styles.LobbyContainer}>
      <span className={classNames("animate-bounce", styles.waiting)}>
        Esperando jogadores
      </span>
      <button
        className={classNames(
          styles.statusButton,
          isPlayerReady ? styles.ready : styles.notReady
        )}
        onClick={handleReadyClick}>
        Estou pronto
      </button>
      <button
        className="p-2 bg-green-600 text-white font-semibold"
        onClick={handleStartGame}>
        Start Game
      </button>
      <Players roomId={roomId} />
    </div>
  );
}
