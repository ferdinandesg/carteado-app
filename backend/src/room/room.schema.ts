import { z } from "zod";
import { userSchema } from "../users/user.schema";
import { cardSchema } from "../cards/card.schema";

export const roomSchema = z.object({
  id: z.string(),
  hash: z.string(),
  name: z.string(),
  password: z.string().optional(),
  players: z.array(userSchema).max(4),
  bunch: z.array(cardSchema),
  size: z.number().min(2)
});

export type RoomInterface = z.infer<typeof roomSchema>;
