import "dotenv/config";
import { PrismaClient, ProductType } from "@prisma/client";
import { DEFAULT_DECK_KEY } from "shared/types";
import { logger } from "@/utils/logger";

/**
 * Catálogo inicial da loja. Idempotente (upsert por `assetKey`), então pode
 * rodar em todo deploy. Preços calibrados com o gold por partida
 * (200 vitória / 100 derrota): um baralho = 2 vitórias ou 4 derrotas.
 */
export const DECK_PRICE = 400;
export const AVATAR_PRICE = 200;

type SeedProduct = {
  type: ProductType;
  assetKey: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isDefault?: boolean;
  sortOrder: number;
};

export const STORE_SEED: SeedProduct[] = [
  {
    type: ProductType.DECK,
    assetKey: DEFAULT_DECK_KEY,
    name: "Baralho Clássico",
    description: "O baralho de todo mundo. Sempre disponível.",
    price: 0,
    isDefault: true,
    sortOrder: 0,
  },
  {
    type: ProductType.DECK,
    assetKey: "baralho02",
    name: "Baralho 02",
    description: "Um traço diferente para a mesa.",
    price: DECK_PRICE,
    sortOrder: 1,
  },
  {
    type: ProductType.DECK,
    assetKey: "baralho03",
    name: "Baralho 03",
    description: "Para quem gosta de mostrar a manilha com estilo.",
    price: DECK_PRICE,
    sortOrder: 2,
  },
  {
    type: ProductType.DECK,
    assetKey: "baralho04",
    name: "Baralho 04",
    description: "Edição do bar da esquina.",
    price: DECK_PRICE,
    sortOrder: 3,
  },
  ...[1, 2, 3, 4].map<SeedProduct>((index) => ({
    type: ProductType.AVATAR,
    assetKey: `avatar${index}`,
    name: `Avatar ${index}`,
    description: "Substitui a sua foto na mesa e no menu.",
    price: AVATAR_PRICE,
    imageUrl: `/assets/avatars/avatar${index}.png`,
    sortOrder: index,
  })),
];

export async function seedStore(prisma: PrismaClient): Promise<void> {
  for (const product of STORE_SEED) {
    const { assetKey, ...data } = product;
    await prisma.product.upsert({
      where: { assetKey },
      create: { assetKey, ...data },
      update: data,
    });
  }
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedStore(prisma)
    .then(() => {
      logger.info({ count: STORE_SEED.length }, "Store seeded.");
    })
    .catch((error: unknown) => {
      logger.error({ err: error }, "Store seed failed.");
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
