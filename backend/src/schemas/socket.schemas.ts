import { z } from "zod";
import { PlayerStatus } from "shared/game";
import { cardSchema } from "@/cards/card.schema";

export const joinRoomSchema = z.object({
  roomHash: z.string().trim().min(1),
});

/** O cliente só alterna prontidão; os demais status são controlados pelo servidor. */
export const setPlayerStatusSchema = z.object({
  status: z.enum([PlayerStatus.READY, PlayerStatus.NOT_READY]),
});

/** Carta como trafegada no socket: mesmo shape de `Card` (vem do estado do servidor). */
export const cardPayloadSchema = cardSchema.extend({
  secondaryValue: z.number().nullable(),
  toString: z.string(),
});

export const playCardSchema = z.object({
  card: cardPayloadSchema,
});

export const pickHandSchema = z.object({
  cards: z.array(cardPayloadSchema).min(1),
});
