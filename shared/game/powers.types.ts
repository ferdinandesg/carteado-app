import { Card } from "../cards";

export enum PowerId {
  X_RAY = "X_RAY",
  SILENCER = "SILENCER",
  CHANGE_TRUMP = "CHANGE_TRUMP",
  MAGNETIC_PULL = "MAGNETIC_PULL",
  GRAVEDIGGER = "GRAVEDIGGER",
}

/**
 * Origem do disparo de um poder. Hoje apenas manual; no futuro, cartas de
 * realeza (K/Q/J) do baralho selecionado dispararão poderes com outra política.
 */
export type PowerTrigger = "MANUAL" | "ROYALTY_CARD";

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
}

export interface UsePowerPayload {
  powerId: PowerId;
  /** Obrigatório para poderes com alvo (X_RAY, SILENCER, MAGNETIC_PULL). */
  targetUserId?: string;
  /** Carta da mão a ser trocada (GRAVEDIGGER). */
  card?: Card;
}

/** Resultado enviado apenas ao jogador que usou o poder (evento `power_result`). */
export type PowerPrivateResult = {
  powerId: PowerId.X_RAY;
  targetUserId: string;
  card: Card;
};
