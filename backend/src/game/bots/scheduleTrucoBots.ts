import type { Namespace } from "socket.io";
import { GameStatus, TRUCO_BOT_DELAY_MS } from "shared/game";

import { TrucoGame } from "../TrucoGameRules";
import { getGameInstance, saveGameInstance } from "@/services/game.service";
import { applyEndOfMatchRewards } from "@/services/rewards.service";
import { finishRoom } from "@/services/room.service";
import { CHANNEL } from "@/socket/channels";
import emitToRoom from "@/socket/utils/emitToRoom";
import { emitGameToRoom } from "@/socket/utils/emitGameToRoom";
import { logger } from "@/utils/logger";

import { needsTrucoBotAction, playTrucoBotStep } from "./playTrucoBots";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearTrucoBotSchedule(roomHash: string): void {
  const timer = timers.get(roomHash);
  if (!timer) return;
  clearTimeout(timer);
  timers.delete(roomHash);
}

export function queueTrucoBotsIfNeeded(
  game: { rulesName?: string },
  roomHash: string,
  channel: Namespace
): void {
  if (game.rulesName !== "TrucoGameRules") return;
  if (!(game instanceof TrucoGame) || !needsTrucoBotAction(game)) return;
  scheduleTrucoBots(roomHash, channel);
}

function scheduleTrucoBots(roomHash: string, channel: Namespace): void {
  clearTrucoBotSchedule(roomHash);
  const timer = setTimeout(() => {
    timers.delete(roomHash);
    void runTrucoBotTick(roomHash, channel);
  }, TRUCO_BOT_DELAY_MS);
  timer.unref?.();
  timers.set(roomHash, timer);
}

async function runTrucoBotTick(
  roomHash: string,
  channel: Namespace
): Promise<void> {
  try {
    const game = await getGameInstance(roomHash);
    if (!(game instanceof TrucoGame) || !needsTrucoBotAction(game)) return;
    if (!playTrucoBotStep(game)) return;

    game.pendingPrivateResult = undefined;
    await applyEndOfMatchRewards(game);
    await saveGameInstance(roomHash, game);

    const room =
      game.status === GameStatus.FINISHED ? await finishRoom(roomHash) : null;

    emitGameToRoom(channel, roomHash, game);
    if (room) {
      emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, room);
    }

    if (needsTrucoBotAction(game)) {
      scheduleTrucoBots(roomHash, channel);
    }
  } catch (err) {
    logger.error({ err, roomHash }, "Truco bot tick failed.");
  }
}
