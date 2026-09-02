import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { PlayerStatus } from "shared/game";

import { useRoomContext } from "@/contexts/room.context";
import { useSocketEmit } from "@/hooks/socket/useSocketEmit";

/**
 * Ações do lobby. `isReady` é derivado da sala vinda do servidor, então o
 * botão reflete o estado real mesmo após reconexão ou refresh.
 */
export function useLobbyActions() {
  const emit = useSocketEmit();
  const { room } = useRoomContext();
  const { data } = useSession();

  const userId = data?.user.id;
  const me = room?.participants.find((p) => p.userId === userId);
  const isReady = me?.status === PlayerStatus.READY;
  const isOwner = Boolean(userId) && room?.ownerId === userId;

  const toggleReady = useCallback(() => {
    if (!room) return;
    emit("set_player_status", {
      status: isReady ? PlayerStatus.NOT_READY : PlayerStatus.READY,
    });
  }, [emit, room, isReady]);

  const startGame = useCallback(() => emit("start_game"), [emit]);

  return { isReady, isOwner, toggleReady, startGame };
}
