import { z } from "zod";

export const roomSchema = z.object({
  id: z.string(),
  hash: z.string(),
  name: z.string(),
  password: z.string().optional(),
  players: z.array(z.string()).max(4),
});

export type RoomInterface = z.infer<typeof roomSchema>;
