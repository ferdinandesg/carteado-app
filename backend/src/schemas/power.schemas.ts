import { z } from "zod";
import { PowerId } from "shared/game";
import { cardSchema } from "@/cards/card.schema";

export const usePowerSchema = z.object({
  powerId: z.enum(PowerId),
  targetUserId: z.string().trim().min(1).optional(),
  card: cardSchema.loose().optional(),
});

export type UsePowerSchemaType = z.infer<typeof usePowerSchema>;
