import prisma from "@/prisma";
import { Product, ProductType } from "@prisma/client";
import { DEFAULT_DECK_KEY, type UserCosmetics } from "shared/types";
import { logger } from "@/utils/logger";

type SlotSource = "loadout" | "default" | "provider";

/**
 * Resolve o que o usuário está usando (baralho e avatar) a partir do
 * loadout + catálogo. Slot vazio cai no produto `isDefault` do tipo; avatar
 * sem produto equipado volta para a foto do provedor (`null`).
 *
 * Único ponto que decide cosméticos: login, `/auth/me` e socket passam aqui.
 */
export async function resolveCosmetics(userId: string): Promise<UserCosmetics> {
  const loadout = await prisma.userLoadout.findUnique({ where: { userId } });
  const slots = loadout?.slots ?? [];

  const equippedIds = slots.map((slot) => slot.productId);
  const products = equippedIds.length
    ? await prisma.product.findMany({ where: { id: { in: equippedIds } } })
    : [];
  const byId = new Map(products.map((product) => [product.id, product]));

  const equipped = (type: ProductType): Product | undefined => {
    const slot = slots.find((entry) => entry.type === type);
    return slot ? byId.get(slot.productId) : undefined;
  };

  const deck = equipped(ProductType.DECK);
  const avatar = equipped(ProductType.AVATAR);

  let skin = deck?.assetKey;
  let deckSource: SlotSource = "loadout";
  if (!skin) {
    const fallback = await prisma.product.findFirst({
      where: { type: ProductType.DECK, isDefault: true },
    });
    skin = fallback?.assetKey ?? DEFAULT_DECK_KEY;
    deckSource = "default";
  }

  const cosmetics: UserCosmetics = {
    skin,
    avatar: avatar?.imageUrl ?? null,
  };

  logger.debug(
    {
      userId,
      deck: { productId: deck?.id, assetKey: skin, source: deckSource },
      avatar: {
        productId: avatar?.id,
        source: (avatar ? "loadout" : "provider") satisfies SlotSource,
      },
    },
    "Cosmetics resolved."
  );

  return cosmetics;
}
