import { ProductType } from "@prisma/client";
import prisma from "@/prisma";
import {
  buyProduct,
  equipProduct,
  listCatalog,
  unequipSlot,
} from "./store.service";

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: {
    product: { findMany: jest.fn() },
    userInventory: { findMany: jest.fn() },
    userLoadout: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedPrisma = prisma as unknown as {
  product: { findMany: jest.Mock };
  userInventory: { findMany: jest.Mock };
  userLoadout: { findUnique: jest.Mock };
  user: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};

const USER_ID = "a".repeat(24);
const PRODUCT_ID = "b".repeat(24);
const DEFAULT_ID = "c".repeat(24);

const product = {
  id: PRODUCT_ID,
  type: ProductType.DECK,
  assetKey: "baralho02",
  name: "Baralho 02",
  description: "Deck",
  price: 400,
  imageUrl: null,
  isDefault: false,
  isActive: true,
  sortOrder: 1,
};

const defaultDeck = {
  ...product,
  id: DEFAULT_ID,
  assetKey: "baralho01",
  price: 0,
  isDefault: true,
  sortOrder: 0,
};

function mockTx(overrides: Record<string, unknown> = {}) {
  return {
    product: { findUnique: jest.fn().mockResolvedValue(product) },
    userInventory: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    userLoadout: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({}),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: USER_ID, cash: 500 }),
      update: jest.fn().mockResolvedValue({}),
    },
    ...overrides,
  };
}

function runInTx(tx: ReturnType<typeof mockTx>) {
  mockedPrisma.$transaction.mockImplementation(
    (fn: (t: typeof tx) => unknown) => fn(tx)
  );
  return tx;
}

describe("store.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listCatalog", () => {
    it("marca default como possuído, cruza inventário e loadout", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([defaultDeck, product]);
      mockedPrisma.userInventory.findMany.mockResolvedValue([
        { productId: PRODUCT_ID },
      ]);
      mockedPrisma.userLoadout.findUnique.mockResolvedValue({
        slots: [{ type: ProductType.DECK, productId: PRODUCT_ID }],
      });
      mockedPrisma.user.findUnique.mockResolvedValue({ cash: 150 });

      const catalog = await listCatalog(USER_ID);

      expect(catalog.cash).toBe(150);
      expect(catalog.items).toEqual([
        expect.objectContaining({
          id: DEFAULT_ID,
          owned: true,
          equipped: false,
        }),
        expect.objectContaining({
          id: PRODUCT_ID,
          owned: true,
          equipped: true,
        }),
      ]);
    });

    it("convidado vê a vitrine só com os defaults possuídos", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([defaultDeck, product]);

      const catalog = await listCatalog(null);

      expect(mockedPrisma.userInventory.findMany).not.toHaveBeenCalled();
      expect(catalog.cash).toBe(0);
      expect(catalog.items.map((item) => item.owned)).toEqual([true, false]);
    });
  });

  describe("buyProduct", () => {
    it("subtrai moedas e cria o inventário", async () => {
      const tx = runInTx(mockTx());

      await buyProduct(USER_ID, PRODUCT_ID);

      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: { cash: 100 },
      });
      expect(tx.userInventory.create).toHaveBeenCalledWith({
        data: { userId: USER_ID, productId: PRODUCT_ID },
      });
    });

    it("falha se o produto não existe ou está inativo", async () => {
      runInTx(
        mockTx({
          product: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ ...product, isActive: false }),
          },
        })
      );

      await expect(buyProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "PRODUCT_NOT_FOUND"
      );
    });

    it("não vende o produto default", async () => {
      runInTx(
        mockTx({
          product: { findUnique: jest.fn().mockResolvedValue(defaultDeck) },
        })
      );

      await expect(buyProduct(USER_ID, DEFAULT_ID)).rejects.toThrow(
        "ALREADY_OWNED"
      );
    });

    it("falha se o usuário já possui o item", async () => {
      runInTx(
        mockTx({
          userInventory: {
            findUnique: jest.fn().mockResolvedValue({ id: "owned" }),
            create: jest.fn(),
          },
        })
      );

      await expect(buyProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "ALREADY_OWNED"
      );
    });

    it("falha se não há moedas suficientes", async () => {
      runInTx(
        mockTx({
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: USER_ID, cash: 10 }),
            update: jest.fn(),
          },
        })
      );

      await expect(buyProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "INSUFFICIENT_FUNDS"
      );
    });
  });

  describe("equipProduct", () => {
    it("substitui o slot do mesmo tipo e preserva os outros", async () => {
      const avatarSlot = {
        type: ProductType.AVATAR,
        productId: "d".repeat(24),
      };
      const tx = runInTx(
        mockTx({
          userInventory: {
            findUnique: jest.fn().mockResolvedValue({ id: "owned" }),
          },
          userLoadout: {
            findUnique: jest.fn().mockResolvedValue({
              slots: [
                avatarSlot,
                { type: ProductType.DECK, productId: DEFAULT_ID },
              ],
            }),
            upsert: jest.fn().mockResolvedValue({}),
          },
        })
      );

      await equipProduct(USER_ID, PRODUCT_ID);

      const slots = [
        avatarSlot,
        { type: ProductType.DECK, productId: PRODUCT_ID },
      ];
      expect(tx.userLoadout.upsert).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        create: { userId: USER_ID, slots },
        update: { slots: { set: slots } },
      });
    });

    it("equipa o default sem consultar o inventário", async () => {
      const tx = runInTx(
        mockTx({
          product: { findUnique: jest.fn().mockResolvedValue(defaultDeck) },
        })
      );

      await equipProduct(USER_ID, DEFAULT_ID);

      expect(tx.userInventory.findUnique).not.toHaveBeenCalled();
      expect(tx.userLoadout.upsert).toHaveBeenCalled();
    });

    it("falha se o item não está no inventário", async () => {
      runInTx(mockTx());

      await expect(equipProduct(USER_ID, PRODUCT_ID)).rejects.toThrow(
        "ITEM_NOT_OWNED"
      );
    });
  });

  describe("unequipSlot", () => {
    it("remove só o slot pedido", async () => {
      const deckSlot = { type: ProductType.DECK, productId: PRODUCT_ID };
      const tx = runInTx(
        mockTx({
          userLoadout: {
            findUnique: jest.fn().mockResolvedValue({
              slots: [
                deckSlot,
                { type: ProductType.AVATAR, productId: "d".repeat(24) },
              ],
            }),
            upsert: jest.fn().mockResolvedValue({}),
          },
        })
      );

      await unequipSlot(USER_ID, ProductType.AVATAR);

      expect(tx.userLoadout.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { slots: { set: [deckSlot] } } })
      );
    });
  });
});
