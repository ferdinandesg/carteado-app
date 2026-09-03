import prisma from "@/prisma";
import { Product, ProductType, User, UserInventory } from "@prisma/client";

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

export type PurchaseResult = {
  user: User;
  inventory: UserInventory & { product: Product };
};

export async function listProducts(): Promise<Product[]> {
  return prisma.product.findMany();
}

export async function buyProduct(
  userId: string,
  productId: string
): Promise<PurchaseResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });
      if (!product) throw new StoreError("PRODUCT_NOT_FOUND");

      const alreadyOwned = await tx.userInventory.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      if (alreadyOwned) throw new StoreError("ALREADY_OWNED");

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new StoreError("USER_NOT_FOUND");

      const cash = user.cash ?? 0;
      if (cash < product.price) throw new StoreError("INSUFFICIENT_FUNDS");

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { cash: cash - product.price },
      });

      const inventory = await tx.userInventory.create({
        data: { userId, productId },
        include: { product: true },
      });

      return { user: updatedUser, inventory };
    });
  } catch (error) {
    if (error instanceof StoreError) throw error;
    throw new StoreError(
      error instanceof Error ? error.message : "PURCHASE_FAILED"
    );
  }
}

export async function equipProduct(
  userId: string,
  productId: string
): Promise<User> {
  try {
    return await prisma.$transaction(async (tx) => {
      const inventoryItem = await tx.userInventory.findUnique({
        where: { userId_productId: { userId, productId } },
        include: { product: true },
      });
      if (!inventoryItem) throw new StoreError("ITEM_NOT_OWNED");

      const data =
        inventoryItem.product.type === ProductType.DECK
          ? { equippedDeckId: productId }
          : { equippedAvatarId: productId };

      return tx.user.update({
        where: { id: userId },
        data,
      });
    });
  } catch (error) {
    if (error instanceof StoreError) throw error;
    throw new StoreError(
      error instanceof Error ? error.message : "EQUIP_FAILED"
    );
  }
}
