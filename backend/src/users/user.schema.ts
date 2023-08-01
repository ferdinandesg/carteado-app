import { z } from "zod";
import { cardSchema } from "../cards/card.schema";


export const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    image: z.string(),
    hand: z.array(cardSchema),
    table: z.array(cardSchema),
})

export type UserType = z.infer<typeof userSchema>