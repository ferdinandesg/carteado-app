import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  image: z.string(),
});

const optionalStringSchema = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.string().optional()
);

export const guestSchema = z.object({
  username: z.string().trim().min(1),
  skin: optionalStringSchema,
  avatar: optionalStringSchema,
});

export type LoginShemaType = z.infer<typeof loginSchema>;
export type GuestSchemaType = z.infer<typeof guestSchema>;
