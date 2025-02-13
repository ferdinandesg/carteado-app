import { z } from "zod";

export const cardSchema = z.object({
  hidden: z.boolean().optional(),
  suit: z.string(),
  rank: z.string(),
  value: z.number(),
});

export type CardType = z.infer<typeof cardSchema>;
