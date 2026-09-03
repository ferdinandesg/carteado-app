import { Request, Response } from "express";
import { ZodError } from "zod";
import { isRegisteredUser } from "shared/types";
import {
  StoreError,
  buyProduct,
  equipProduct,
  listCatalog,
  unequipSlot,
} from "@/services/store.service";
import {
  productIdBodySchema,
  productTypeParamsSchema,
} from "@/schemas/store.schemas";
import { serializeRouteError } from "@/utils/routeError";
import { reqLogger } from "@/utils/logContext";

function statusForStoreError(error: StoreError): number {
  switch (error.message) {
    case "PRODUCT_NOT_FOUND":
    case "USER_NOT_FOUND":
      return 404;
    case "ITEM_NOT_OWNED":
    case "GUEST_NOT_ALLOWED":
      return 403;
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

/** Convidados não têm inventário/loadout persistidos: só veem a vitrine. */
function registeredUserId(req: Request): string | null {
  return isRegisteredUser(req.user) ? req.user.id : null;
}

function requireRegisteredUserId(req: Request): string {
  const userId = registeredUserId(req);
  if (!userId) throw new StoreError("GUEST_NOT_ALLOWED");
  return userId;
}

/** Toda mutação devolve o catálogo atualizado: o front não precisa refetch. */
async function respondWithCatalog(req: Request, res: Response) {
  res.status(200).json(await listCatalog(registeredUserId(req)));
}

export async function handleListCatalog(req: Request, res: Response) {
  try {
    await respondWithCatalog(req, res);
  } catch (error) {
    handleError(req, res, error, "Failed to list catalog.");
  }
}

export async function handleBuyProduct(req: Request, res: Response) {
  try {
    const userId = requireRegisteredUserId(req);
    const { productId } = productIdBodySchema.parse(req.body);
    await buyProduct(userId, productId);
    await respondWithCatalog(req, res);
  } catch (error) {
    handleError(req, res, error, "Failed to buy product.");
  }
}

export async function handleEquipProduct(req: Request, res: Response) {
  try {
    const userId = requireRegisteredUserId(req);
    const { productId } = productIdBodySchema.parse(req.body);
    await equipProduct(userId, productId);
    await respondWithCatalog(req, res);
  } catch (error) {
    handleError(req, res, error, "Failed to equip product.");
  }
}

export async function handleUnequipSlot(req: Request, res: Response) {
  try {
    const userId = requireRegisteredUserId(req);
    const { type } = productTypeParamsSchema.parse(req.params);
    await unequipSlot(userId, type);
    await respondWithCatalog(req, res);
  } catch (error) {
    handleError(req, res, error, "Failed to clear slot.");
  }
}
