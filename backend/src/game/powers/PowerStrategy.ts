import type { Card } from "shared/cards";
import type { Team } from "shared/types";
import type {
  ActiveEffect,
  BasePlayer,
  PowerId,
  PowerPrivateResult,
  UsePowerPayload,
} from "shared/game";
import type { TrucoGame } from "../TrucoGameRules";

/**
 * Como o poder escolhe alvo. O executor resolve e valida o alvo antes de
 * chamar `execute`, para que cada estratégia só contenha a regra do poder.
 */
export type PowerTargeting = "NONE" | "OPPONENT";

export interface PowerContext {
  userId: string;
  payload: UsePowerPayload;
  /** Preenchido pelo executor quando `targeting === "OPPONENT"`. */
  target?: BasePlayer;
}

export interface PowerResult {
  /** Informação visível apenas para quem usou o poder (ex.: carta espiada). */
  privateResult?: PowerPrivateResult;
  /** Coveiro: carta que volta para o baralho restante. */
  returnedCard?: Card;
  /** Coveiro: carta do baralho que fica na mesa. */
  replacementCard?: Card;
  /**
   * Escudo de Prata: ao ativar com truco pendente, corre a rodada por
   * este valor (em vez da aposta anterior).
   */
  rejectPoints?: number;
}

/**
 * Strategy de um poder. `execute` aplica o efeito imediato; os hooks opcionais
 * são despachados pelo motor (via `effects.ts`) para cada `ActiveEffect`
 * pertencente a este poder, evitando `if/else` por poder no loop do jogo.
 */
export interface PowerStrategy {
  readonly id: PowerId;
  readonly targeting: PowerTargeting;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult;

  onBeforeAskTruco?(
    game: TrucoGame,
    effect: ActiveEffect,
    userId: string
  ): void;
  onBeforePlayCard?(
    game: TrucoGame,
    effect: ActiveEffect,
    userId: string,
    card: Card
  ): void;
  onAfterPlayCard?(
    game: TrucoGame,
    effect: ActiveEffect,
    userId: string,
    card: Card
  ): void;
  /** Escudo de Prata: pode reduzir os pontos pagos ao correr. */
  onRejectTrucoPoints?(
    game: TrucoGame,
    effect: ActiveEffect,
    points: number
  ): number;
  /** Mercenário: aplica o roubo depois de somar a aposta da rodada. */
  onAfterFinishRound?(
    game: TrucoGame,
    effect: ActiveEffect,
    winningTeam: Team
  ): void;
}

export const isSameCard = (a: Card, b: Card): boolean =>
  a.rank === b.rank && a.suit === b.suit;
