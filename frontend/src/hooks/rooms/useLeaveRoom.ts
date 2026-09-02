import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useSocketEmit } from "@/hooks/socket/useSocketEmit";

/** Avisa o servidor que o jogador saiu da sala e volta ao menu. */
export function useLeaveRoom(roomHash: string | undefined) {
  const emit = useSocketEmit();
  const router = useRouter();

  return useCallback(() => {
    if (roomHash) emit("quit", { roomHash });
    router.push("/menu");
  }, [emit, router, roomHash]);
}
