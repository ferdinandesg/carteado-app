import { z } from "zod";

export const cardSchema = z.object({
  isHidden: z.boolean().optional(),
  suit: z.string(),
  rank: z.string(),
  value: z.number(),
});

export type CardType = z.infer<typeof cardSchema>;
