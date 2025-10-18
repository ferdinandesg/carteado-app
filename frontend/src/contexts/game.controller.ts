"use client";

import { useEffect } from "react";
import { useSocket } from "@//contexts/socket.context"; // seu socket context
import { useGameStore } from "./game.store";
import { useSession } from "next-auth/react";
import { IGameState } from "shared/game";

// Este componente não renderiza nada, apenas gerencia a lógica.
export function GameController() {
  const { socket } = useSocket();
  const { data } = useSession();
  // Pegamos as ações do nosso store
  const { setGame, setSocket, setUserId } = useGameStore();

  useEffect(() => {
    setSocket(socket);

    // 2. Ouve o evento de atualização do jogo
    const handleGameUpdate = (updatedGame: IGameState) => {
      setGame(updatedGame);
    };

    socket.on("game_updated", (updated) => {
      handleGameUpdate(updated);
    });

    return () => {
      socket.off("game_updated", handleGameUpdate);
    };
  }, [socket, setGame, setSocket]);

  useEffect(() => {
    if (!data?.user.id) return;
    setUserId(data.user.id);
  }, [data]);

  return null;
}
