import prisma from "@/prisma";
import { Prisma, Product, ProductType } from "@prisma/client";
import type { Catalog, CatalogItem } from "shared/types";
import { logger } from "@/utils/logger";

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

type Tx = Prisma.TransactionClient;

function toCatalogItem(
  product: Product,
  ownedIds: Set<string>,
  equippedIds: Set<string>
): CatalogItem {
  return {
    id: product.id,
    type: product.type,
    assetKey: product.assetKey,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    isDefault: product.isDefault,
    owned: product.isDefault || ownedIds.has(product.id),
    equipped: equippedIds.has(product.id),
  };
}

/**
 * Catálogo ativo já resolvido para o usuário (posse, equipado, saldo).
 * `userId: null` = convidado: só vê a vitrine, possui apenas os defaults.
 */
export async function listCatalog(userId: string | null): Promise<Catalog> {
  const [products, inventory, loadout, user] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    }),
    userId ? prisma.userInventory.findMany({ where: { userId } }) : [],
    userId ? prisma.userLoadout.findUnique({ where: { userId } }) : null,
    userId ? prisma.user.findUnique({ where: { id: userId } }) : null,
  ]);

  const ownedIds = new Set(inventory.map((entry) => entry.productId));
  const equippedIds = new Set(
    (loadout?.slots ?? []).map((slot) => slot.productId)
  );

  return {
    items: products.map((product) =>
      toCatalogItem(product, ownedIds, equippedIds)
    ),
    cash: user?.cash ?? 0,
  };
}

async function findOwnedProduct(
  tx: Tx,
  userId: string,
  productId: string
): Promise<Product> {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new StoreError("PRODUCT_NOT_FOUND");
  if (product.isDefault) return product;

  const owned = await tx.userInventory.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!owned) throw new StoreError("ITEM_NOT_OWNED");
  return product;
}

function wrapStoreError(error: unknown, fallback: string): never {
  if (error instanceof StoreError) throw error;
  throw new StoreError(error instanceof Error ? error.message : fallback);
}

export async function buyProduct(
  userId: string,
  productId: string
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });
      if (!product || !product.isActive) {
        throw new StoreError("PRODUCT_NOT_FOUND");
      }
      if (product.isDefault) throw new StoreError("ALREADY_OWNED");

      const alreadyOwned = await tx.userInventory.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      if (alreadyOwned) throw new StoreError("ALREADY_OWNED");

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new StoreError("USER_NOT_FOUND");

      const cash = user.cash ?? 0;
      if (cash < product.price) throw new StoreError("INSUFFICIENT_FUNDS");

      await tx.user.update({
        where: { id: userId },
        data: { cash: cash - product.price },
      });
      await tx.userInventory.create({ data: { userId, productId } });

      logger.info(
        {
          userId,
          productId,
          type: product.type,
          assetKey: product.assetKey,
          price: product.price,
          cashAfter: cash - product.price,
        },
        "Product purchased."
      );
    });
  } catch (error) {
    wrapStoreError(error, "PURCHASE_FAILED");
  }
}

async function writeSlots(
  tx: Tx,
  userId: string,
  type: ProductType,
  productId: string | null
): Promise<void> {
  const current = await tx.userLoadout.findUnique({ where: { userId } });
  const others = (current?.slots ?? []).filter((slot) => slot.type !== type);
  const slots = productId ? [...others, { type, productId }] : others;

  await tx.userLoadout.upsert({
    where: { userId },
    create: { userId, slots },
    update: { slots: { set: slots } },
  });

  logger.info(
    {
      userId,
      slot: type,
      productId,
      previousProductId:
        current?.slots.find((slot) => slot.type === type)?.productId ?? null,
    },
    productId ? "Product equipped." : "Slot cleared."
  );
}

/** Equipa um item possuído no slot do seu tipo (um por tipo). */
export async function equipProduct(
  userId: string,
  productId: string
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const product = await findOwnedProduct(tx, userId, productId);
      await writeSlots(tx, userId, product.type, product.id);
    });
  } catch (error) {
    wrapStoreError(error, "EQUIP_FAILED");
  }
}

/** Esvazia o slot: baralho volta ao default, avatar volta à foto do provedor. */
export async function unequipSlot(
  userId: string,
  type: ProductType
): Promise<void> {
  try {
    await prisma.$transaction((tx) => writeSlots(tx, userId, type, null));
  } catch (error) {
    wrapStoreError(error, "UNEQUIP_FAILED");
  }
}
