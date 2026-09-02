import { BasePlayer } from "shared/game";

/**
 * Assentos da mesa 3x3 (numeração 1..9, linha a linha).
 * O jogador local ocupa sempre o slot 8; oponentes preenchem por prioridade
 * `2 → 6 → 4`, mantendo a ordem horária a partir do jogador local
 * (`orderedOpponents[0]` é o próximo a jogar depois de mim).
 */
export type TableSeats = {
  slot2: BasePlayer | null;
  slot4: BasePlayer | null;
  slot6: BasePlayer | null;
};

export type SeatSlot = keyof TableSeats;

const EMPTY_SEATS: TableSeats = { slot2: null, slot4: null, slot6: null };

export function resolveTableSeats(
  playerCount: number,
  orderedOpponents: BasePlayer[]
): TableSeats {
  if (orderedOpponents.length === 0) return { ...EMPTY_SEATS };

  if (playerCount <= 2) {
    return { ...EMPTY_SEATS, slot2: orderedOpponents[0] };
  }

  if (playerCount === 3) {
    return {
      ...EMPTY_SEATS,
      slot2: orderedOpponents[0],
      slot6: orderedOpponents[1] ?? null,
    };
  }

  // 4 jogadores: horário = esquerda (4), frente/parceiro (2), direita (6).
  return {
    slot4: orderedOpponents[0] ?? null,
    slot2: orderedOpponents[1] ?? null,
    slot6: orderedOpponents[2] ?? null,
  };
}
