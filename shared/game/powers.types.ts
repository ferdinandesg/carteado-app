import { Card } from "../cards";

export enum PowerId {
  X_RAY = "X_RAY",
  SILENCER = "SILENCER",
  CHANGE_TRUMP = "CHANGE_TRUMP",
  MAGNETIC_PULL = "MAGNETIC_PULL",
  GRAVEDIGGER = "GRAVEDIGGER",
  SILVER_SHIELD = "SILVER_SHIELD",
  MERCENARY = "MERCENARY",
  SIXTH_SENSE = "SIXTH_SENSE",
  ILLUSIONIST = "ILLUSIONIST",
}

export function isPowerId(value: string): value is PowerId {
  return (Object.values(PowerId) as string[]).includes(value);
}

/** Teto de carimbos por mão de Truco (cartas sorteadas do pool). */
export const TRUCO_POWERS_PER_ROUND = 3;

/** Chance de cada carta elegível receber um poder. */
export const TRUCO_POWER_STAMP_CHANCE = 0.1;

/**
 * Origem do disparo. `CARD` = carta carimbada no deal; `MANUAL` = evento
 * `use_power`; `ROYALTY_CARD` reservado para um modo futuro por rank.
 */
export type PowerTrigger = "MANUAL" | "CARD" | "ROYALTY_CARD";

/** Efeito persistente aplicado a um jogador (ex.: silenciado, atração magnética). */
export interface ActiveEffect {
  id: string;
  powerId: PowerId;
  sourceUserId: string;
  targetUserId: string;
  /** Rodada em que o efeito foi criado; efeitos são limpos ao iniciar uma nova rodada. */
  round: number;
}

/** Registro público de uso (cooldown + histórico exibível na UI). */
export interface PowerUsage {
  powerId: PowerId;
  userId: string;
  targetUserId?: string;
  round: number;
  trigger: PowerTrigger;
  /** Coveiro: carta que volta para o baralho restante. */
  returnedCard?: Card;
  /** Coveiro: carta do baralho que fica na mesa. */
  replacementCard?: Card;
}

export interface UsePowerPayload {
  powerId: PowerId;
  /** Obrigatório para poderes com alvo (X_RAY, SILENCER, MAGNETIC_PULL, SIXTH_SENSE). */
  targetUserId?: string;
}

/** Resultado enviado apenas ao jogador que usou o poder (evento `power_result`). */
export type PowerPrivateResult =
  | {
      powerId: PowerId.X_RAY;
      targetUserId: string;
      card: Card;
    }
  | {
      powerId: PowerId.SIXTH_SENSE;
      targetUserId: string;
      hasManilha: boolean;
    };
