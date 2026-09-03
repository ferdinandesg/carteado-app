import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, "Must be a valid product id");

export const productIdBodySchema = z.object({
  productId: objectId,
});
