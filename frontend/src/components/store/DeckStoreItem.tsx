"use client";

import { Coins } from "lucide-react";
import { Card } from "shared/cards";

import CardFan from "@/components/CardFan";
import ActionButton from "@/components/buttons/ActionButton";
import useStore, { type IProduct } from "@/hooks/store/useStore";

import styles from "@styles/DeckStoreItem.module.scss";

export type DeckProduct = IProduct & { type: "DECK" };

type DeckStoreItemProps = {
  product: DeckProduct;
};

const PREVIEW_CARDS: Card[] = [
  {
    rank: "K",
    suit: "hearts",
    value: 13,
    secondaryValue: null,
    toString: "K of hearts",
  },
  {
    rank: "J",
    suit: "spades",
    value: 11,
    secondaryValue: null,
    toString: "J of spades",
  },
  {
    rank: "Q",
    suit: "diamonds",
    value: 12,
    secondaryValue: null,
    toString: "Q of diamonds",
  },
];

function resolveDeckSkin(imageUrl: string): string {
  const fromAssets = imageUrl.match(/\/assets\/skins\/([^/]+)/);
  if (fromAssets?.[1]) return fromAssets[1];

  const folder = imageUrl.replace(/^\/+|\/+$/g, "");
  if (folder && !folder.includes(".")) return folder;

  return "baralho01";
}

export default function DeckStoreItem({ product }: DeckStoreItemProps) {
  const { inventory, isLoading, purchaseItem, equipItem } = useStore();
  const owned = inventory.some((item) => item.id === product.id);

  const handleAction = () => {
    if (owned) {
      void equipItem(product.id);
      return;
    }
    void purchaseItem(product.id);
  };

  return (
    <article className={styles.item}>
      <div className={styles.fan}>
        <CardFan
          cards={PREVIEW_CARDS}
          size="sm"
          skin={resolveDeckSkin(product.imageUrl)}
          enableLayout={false}
        />
      </div>
      <ActionButton
        type="button"
        variant={owned ? "secondary" : "primary"}
        size="sm"
        fullWidth
        isLoading={isLoading}
        icon={owned ? undefined : <Coins size={16} />}
        onClick={handleAction}>
        {owned ? "Equipar" : product.price}
      </ActionButton>
    </article>
  );
}
