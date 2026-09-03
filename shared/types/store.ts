export const PRODUCT_TYPES = ["DECK", "AVATAR"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const isProductType = (value: unknown): value is ProductType =>
  typeof value === "string" &&
  (PRODUCT_TYPES as readonly string[]).includes(value);

/** Chave do baralho que todo usuário possui. */
export const DEFAULT_DECK_KEY = "baralho01";

/** Item do catálogo já resolvido para o usuário que pediu. */
export type CatalogItem = {
  id: string;
  type: ProductType;
  assetKey: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isDefault: boolean;
  owned: boolean;
  equipped: boolean;
};

export type Catalog = {
  items: CatalogItem[];
  /** Saldo atual, para o front não depender do refresh da sessão. */
  cash: number;
};

/**
 * Cosméticos resolvidos (loadout + defaults).
 * `skin` é o `assetKey` do baralho; `avatar` é a URL do avatar equipado
 * ou `null` quando o usuário está com a foto do provedor.
 */
export type UserCosmetics = {
  skin: string;
  avatar: string | null;
};
