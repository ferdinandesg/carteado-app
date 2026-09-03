import { z } from "zod";
import { PRODUCT_TYPES } from "shared/types";

const objectId = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, "Must be a valid product id");

export const productIdBodySchema = z.object({
  productId: objectId,
});

export const productTypeParamsSchema = z.object({
  type: z.enum(PRODUCT_TYPES),
});
