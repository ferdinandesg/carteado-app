import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  image: z.string(),
});

export type LoginShemaType = z.infer<typeof loginSchema>;
