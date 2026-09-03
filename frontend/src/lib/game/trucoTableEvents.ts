import { Card, sameCard } from "shared/cards";
import { GameStatus, ITrucoGameState } from "shared/game";
import { HandResult } from "shared/types";

/**
 * Eventos de apresentação derivados da diferença entre dois snapshots de
 * `game_updated`. O servidor não emite eventos granulares, então a UI infere
 * "o que aconteceu" para animar.
 */
export type TrucoTableEvent =
  | { type: "cardPlayed"; card: Card; playerId: string }
  | {
      type: "trickFinished";
      result: HandResult;
      /** Mesa como estava antes da revelação (Ilusionista): face falsa por posição. */
      disguisedBunch?: Card[];
    }
  | {
      type: "trucoAsked";
      askerId: string;
      /** Valor proposto (já refletido em `currentBet`). */
      bet: number;
    }
  | { type: "trucoAccepted"; bet: number }
  | {
      type: "trucoRejected";
      /** Time que pediu e leva os pontos. */
      winnerTeamId: string | null;
      points: number;
    }
  | {
      type: "roundFinished";
      winnerTeamId: string | null;
      points: number;
      previousRound: number;
    }
  | { type: "matchFinished"; winnerTeamId: string | null }
  | {
      type: "powerUsed";
      powerId: string;
      userId: string;
      targetUserId?: string;
      returnedCard?: Card;
      replacementCard?: Card;
    };

function findScoringTeam(prev: ITrucoGameState, next: ITrucoGameState) {
  for (const team of next.teams) {
    const before = prev.teams.find((t) => t.id === team.id);
    if (before && team.score > before.score) {
      return { teamId: team.id, points: team.score - before.score };
    }
  }
  return null;
}

export function diffTrucoSnapshots(
  prev: ITrucoGameState | null,
  next: ITrucoGameState
): TrucoTableEvent[] {
  if (!prev || prev.id !== next.id) return [];

  const events: TrucoTableEvent[] = [];
  const newResults = next.handsResults.slice(prev.handsResults.length);
  const trickFinished = newResults.length > 0;

  // Cartas que entraram na mesa neste update. Dentro da vaza comparamos por
  // identidade (o Coveiro troca uma carta já jogada). Quando a vaza fecha, a
  // última carta só aparece no HandResult, e o Ilusionista revela a face real
  // das anteriores — por isso ali só contamos as posições novas.
  const playedNow: Card[] = trickFinished
    ? newResults.flatMap((r) => r.bunch).slice(prev.bunch.length)
    : next.bunch.filter((card) => !prev.bunch.some((c) => sameCard(c, card)));
  for (const card of playedNow) {
    events.push({ type: "cardPlayed", card, playerId: prev.playerTurn });
  }

  newResults.forEach((result, index) => {
    const wasDisguised =
      index === 0 &&
      prev.bunch.some(
        (card, i) => result.bunch[i] && !sameCard(card, result.bunch[i])
      );
    events.push(
      wasDisguised
        ? { type: "trickFinished", result, disguisedBunch: prev.bunch }
        : { type: "trickFinished", result }
    );
  });

  const wasPending = prev.trucoState === "PENDING";
  const isPending = next.trucoState === "PENDING";
  const roundAdvanced =
    next.rounds > prev.rounds ||
    (next.status === GameStatus.FINISHED &&
      prev.status !== GameStatus.FINISHED);

  if (!wasPending && isPending && next.trucoAskerId) {
    events.push({
      type: "trucoAsked",
      askerId: next.trucoAskerId,
      bet: next.currentBet,
    });
  } else if (
    wasPending &&
    isPending &&
    next.trucoAskerId &&
    next.trucoAskerId !== prev.trucoAskerId &&
    next.currentBet > prev.currentBet
  ) {
    // Contra-pedido direto (retruco) sem passar por ACCEPTED.
    events.push({
      type: "trucoAsked",
      askerId: next.trucoAskerId,
      bet: next.currentBet,
    });
  } else if (wasPending && next.trucoState === "ACCEPTED") {
    events.push({ type: "trucoAccepted", bet: next.currentBet });
  }

  const scoring = findScoringTeam(prev, next);

  const newUsages = (next.powerUsages ?? []).slice(
    (prev.powerUsages ?? []).length
  );
  for (const usage of newUsages) {
    events.push({
      type: "powerUsed",
      powerId: usage.powerId,
      userId: usage.userId,
      targetUserId: usage.targetUserId,
      returnedCard: usage.returnedCard,
      replacementCard: usage.replacementCard,
    });
  }

  if (wasPending && roundAdvanced && !trickFinished) {
    events.push({
      type: "trucoRejected",
      winnerTeamId: scoring?.teamId ?? null,
      points: scoring?.points ?? 0,
    });
  }

  if (roundAdvanced) {
    events.push({
      type: "roundFinished",
      winnerTeamId: scoring?.teamId ?? null,
      points: scoring?.points ?? 0,
      previousRound: prev.rounds,
    });
  }

  if (
    next.status === GameStatus.FINISHED &&
    prev.status !== GameStatus.FINISHED
  ) {
    events.push({
      type: "matchFinished",
      winnerTeamId:
        next.teams.find((t) => t.score >= 12)?.id ?? scoring?.teamId ?? null,
    });
  }

  return events;
}
