import type { Namespace } from "socket.io";
import { GameStatus, TRUCO_BOT_DELAY_MS } from "shared/game";

import { TrucoGame } from "../TrucoGameRules";
import { getGameInstance, saveGameInstance } from "@/services/game.service";
import { applyEndOfMatchRewards } from "@/services/rewards.service";
import { finishRoom } from "@/services/room.service";
import { CHANNEL } from "shared/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import { emitGameToRoom } from "@/socket/utils/emitGameToRoom";
import { logger } from "@/utils/logger";
import { withRoomLock } from "@/lib/locks/withRoomLock";

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

async function playBotStepLocked(roomHash: string) {
  const game = await getGameInstance(roomHash);
  if (!(game instanceof TrucoGame) || !needsTrucoBotAction(game)) return null;
  if (!playTrucoBotStep(game)) return null;

  game.pendingPrivateResult = undefined;
  await applyEndOfMatchRewards(game);
  await saveGameInstance(roomHash, game);

  const room =
    game.status === GameStatus.FINISHED ? await finishRoom(roomHash) : null;
  return { game, room };
}

async function runTrucoBotTick(
  roomHash: string,
  channel: Namespace
): Promise<void> {
  try {
    const result = await withRoomLock(roomHash, () =>
      playBotStepLocked(roomHash)
    );
    if (!result) return;
    const { game, room } = result;

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
