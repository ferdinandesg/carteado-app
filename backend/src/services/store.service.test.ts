import { ProductType } from "@prisma/client";
import prisma from "@/prisma";
import { buyProduct, equipProduct, listProducts } from "./store.service";

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: {
    product: { findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedPrisma = prisma as unknown as {
  product: { findMany: jest.Mock };
  $transaction: jest.Mock;
};

const USER_ID = "a".repeat(24);
const PRODUCT_ID = "b".repeat(24);

const product = {
  id: PRODUCT_ID,
  name: "Baralho 02",
  description: "Deck",
  price: 100,
  type: ProductType.DECK,
  imageUrl: "/assets/skins/baralho02/clubs/Kclubs.png",
};

function mockTx(overrides: Record<string, unknown> = {}) {
  return {
    product: { findUnique: jest.fn().mockResolvedValue(product) },
    userInventory: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: "inv-1",
        userId: USER_ID,
        productId: PRODUCT_ID,
        product,
      }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: USER_ID,
        cash: 200,
      }),
      update: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: USER_ID, ...data })
        ),
    },
    ...overrides,
  };
}

describe("store.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lista os produtos", async () => {
    mockedPrisma.product.findMany.mockResolvedValue([product]);
    await expect(listProducts()).resolves.toEqual([product]);
  });

  describe("buyProduct", () => {
    it("subtrai moedas e cria o inventário", async () => {
      const tx = mockTx();
      mockedPrisma.$transaction.mockImplementation(
        (fn: (t: typeof tx) => unknown) => fn(tx)
      );

      const result = await buyProduct(USER_ID, PRODUCT_ID);

      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: { cash: 100 },
      });
      expect(tx.userInventory.create).toHaveBeenCalledWith({
        data: { userId: USER_ID, productId: PRODUCT_ID },
        include: { product: true },
      });
      expect(result.inventory.product.id).toBe(PRODUCT_ID);
    });

    it("falha se o produto não existe", async () => {
      const tx = mockTx({
        product: { findUnique: jest.fn().mockResolvedValue(null) },
      });
      mockedPrisma.$transaction.mockImplementation(
        (fn: (t: typeof tx) => unknown) => fn(tx)
      );

      await expect(buyProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "PRODUCT_NOT_FOUND"
      );
    });

    it("falha se o usuário já possui o item", async () => {
      const tx = mockTx({
        userInventory: {
          findUnique: jest.fn().mockResolvedValue({ id: "owned" }),
        },
      });
      mockedPrisma.$transaction.mockImplementation(
        (fn: (t: typeof tx) => unknown) => fn(tx)
      );

      await expect(buyProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "ALREADY_OWNED"
      );
    });

    it("falha se não há moedas suficientes", async () => {
      const tx = mockTx({
        user: {
          findUnique: jest.fn().mockResolvedValue({ id: USER_ID, cash: 10 }),
        },
      });
      mockedPrisma.$transaction.mockImplementation(
        (fn: (t: typeof tx) => unknown) => fn(tx)
      );

      await expect(buyProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "INSUFFICIENT_FUNDS"
      );
    });
  });

  describe("equipProduct", () => {
    it("equipe um DECK no usuário", async () => {
      const tx = mockTx({
        userInventory: {
          findUnique: jest.fn().mockResolvedValue({
            product,
          }),
        },
      });
      mockedPrisma.$transaction.mockImplementation(
        (fn: (t: typeof tx) => unknown) => fn(tx)
      );

      await equipProduct(USER_ID, PRODUCT_ID);

      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: { equippedDeckId: PRODUCT_ID },
      });
    });

    it("falha se o item não está no inventário", async () => {
      const tx = mockTx({
        userInventory: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      });
      mockedPrisma.$transaction.mockImplementation(
        (fn: (t: typeof tx) => unknown) => fn(tx)
      );

      await expect(equipProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "ITEM_NOT_OWNED"
      );
    });
  });
});
