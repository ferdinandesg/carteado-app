"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useSocketEvent } from "@/hooks/socket/useSocketEvent";
import { useGameStore } from "./game.store";

/** Não renderiza nada: espelha `game_updated` e o usuário logado no store. */
export function GameController() {
  const { data } = useSession();
  const setGame = useGameStore((state) => state.setGame);
  const setUserId = useGameStore((state) => state.setUserId);

  useSocketEvent("game_updated", setGame);

  useEffect(() => {
    if (!data?.user.id) return;
    setUserId(data.user.id);
  }, [data, setUserId]);

  return null;
}
