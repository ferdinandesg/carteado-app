import { z } from "zod";
import { PowerId } from "shared/game";

export const usePowerSchema = z.object({
  powerId: z.enum(PowerId),
  targetUserId: z.string().trim().min(1).optional(),
});

export type UsePowerSchemaType = z.infer<typeof usePowerSchema>;
