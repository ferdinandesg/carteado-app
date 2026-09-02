import { Card } from "shared/cards";
import { GameStatus, ITrucoGameState } from "shared/game";
import { HandResult } from "shared/types";

/**
 * Eventos de apresentação derivados da diferença entre dois snapshots de
 * `game_updated`. O servidor não emite eventos granulares, então a UI infere
 * "o que aconteceu" para animar.
 */
export type TrucoTableEvent =
  | { type: "cardPlayed"; card: Card; playerId: string }
  | { type: "trickFinished"; result: HandResult }
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
  | { type: "matchFinished"; winnerTeamId: string | null };

const sameCard = (a: Card, b: Card) => a.rank === b.rank && a.suit === b.suit;

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

  // Cartas que entraram na mesa neste update. Se a vaza fechou, a última
  // carta nunca aparece em `bunch` — só dentro do HandResult.
  const playedNow: Card[] = trickFinished
    ? newResults
        .flatMap((r) => r.bunch)
        .filter((card) => !prev.bunch.some((c) => sameCard(c, card)))
    : next.bunch.filter((card) => !prev.bunch.some((c) => sameCard(c, card)));

  for (const card of playedNow) {
    events.push({ type: "cardPlayed", card, playerId: prev.playerTurn });
  }

  for (const result of newResults) {
    events.push({ type: "trickFinished", result });
  }

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
