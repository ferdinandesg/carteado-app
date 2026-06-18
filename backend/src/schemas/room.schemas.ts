import { z } from "zod";

export const roomRuleSchema = z.enum(["CarteadoGameRules", "TrucoGameRules"]);

export const createRoomSchema = z
  .object({
    name: z.string().trim().min(1),
    size: z.coerce.number().int(),
    rule: roomRuleSchema,
  })
  .refine((room) => [2, 3, 4].includes(room.size), {
    message: "INVALID_ROOM_SIZE",
    path: ["size"],
  })
  .refine((room) => room.rule !== "TrucoGameRules" || room.size !== 3, {
    message: "INVALID_ROOM_SIZE_FOR_RULE",
    path: ["size"],
  });

export type CreateRoomSchemaType = z.infer<typeof createRoomSchema>;
