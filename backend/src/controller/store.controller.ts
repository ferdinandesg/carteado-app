import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  StoreError,
  buyProduct,
  equipProduct,
  listProducts,
} from "@/services/store.service";
import { productIdBodySchema } from "@/schemas/store.schemas";
import { serializeRouteError } from "@/utils/routeError";
import { reqLogger } from "@/utils/logContext";

function statusForStoreError(error: StoreError): number {
  switch (error.message) {
    case "PRODUCT_NOT_FOUND":
    case "USER_NOT_FOUND":
    case "ITEM_NOT_OWNED":
      return 404;
    case "INSUFFICIENT_FUNDS":
    case "ALREADY_OWNED":
      return 400;
    default:
      return 500;
  }
}

function handleError(req: Request, res: Response, error: unknown, log: string) {
  reqLogger(req).error({ err: error }, log);
  if (error instanceof StoreError) {
    res.status(statusForStoreError(error)).json({ message: error.message });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json(serializeRouteError(error));
    return;
  }
  res.status(500).json(serializeRouteError(error));
}

export async function handleListProducts(req: Request, res: Response) {
  try {
    const products = await listProducts();
    res.status(200).json(products);
  } catch (error) {
    handleError(req, res, error, "Failed to list products.");
  }
}

export async function handleBuyProduct(req: Request, res: Response) {
  try {
    const { productId } = productIdBodySchema.parse(req.body);
    const result = await buyProduct(req.user.id, productId);
    reqLogger(req).info({ productId }, "Product purchased.");
    res.status(200).json(result);
  } catch (error) {
    handleError(req, res, error, "Failed to buy product.");
  }
}

export async function handleEquipProduct(req: Request, res: Response) {
  try {
    const { productId } = productIdBodySchema.parse(req.body);
    const user = await equipProduct(req.user.id, productId);
    reqLogger(req).info({ productId }, "Product equipped.");
    res.status(200).json(user);
  } catch (error) {
    handleError(req, res, error, "Failed to equip product.");
  }
}
