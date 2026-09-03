"use client";

import classNames from "classnames";
import { Check, Coins } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { CatalogItem } from "shared/types";

import ActionButton from "@/components/buttons/ActionButton";
import SkinPreview from "@/components/SkinPreview";

import styles from "@/styles/StoreItem.module.scss";

type StoreItemProps = {
  item: CatalogItem;
  onBuy: (item: CatalogItem) => void;
  onEquip: (item: CatalogItem) => void;
  busy?: boolean;
  /** Convidado: vê a vitrine, mas não compra nem equipa. */
  readOnly?: boolean;
};

/** Amostra do item: leque da realeza para baralhos, imagem para o resto. */
export function StoreItemPreview({ item }: { item: CatalogItem }) {
  if (item.type === "DECK") {
    return (
      <SkinPreview
        skin={item.assetKey}
        size="md"
      />
    );
  }
  return (
    <div className={styles.avatarPreview}>
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={112}
          height={112}
        />
      )}
    </div>
  );
}

export default function StoreItem({
  item,
  onBuy,
  onEquip,
  busy = false,
  readOnly = false,
}: StoreItemProps) {
  const { t } = useTranslation();

  const action = item.equipped ? (
    <ActionButton
      type="button"
      variant="ghost"
      size="sm"
      fullWidth
      disabled
      icon={<Check size={16} />}>
      {t("Store.equipped")}
    </ActionButton>
  ) : item.owned ? (
    <ActionButton
      type="button"
      variant="secondary"
      size="sm"
      fullWidth
      isLoading={busy}
      disabled={readOnly}
      onClick={() => onEquip(item)}>
      {t("Store.equip")}
    </ActionButton>
  ) : (
    <ActionButton
      type="button"
      variant="primary"
      size="sm"
      fullWidth
      isLoading={busy}
      disabled={readOnly}
      icon={<Coins size={16} />}
      onClick={() => onBuy(item)}
      aria-label={t("Store.buyFor", { price: item.price })}>
      {item.price}
    </ActionButton>
  );

  return (
    <article
      className={classNames(styles.item, { [styles.equipped]: item.equipped })}
      data-testid={`store-item-${item.assetKey}`}>
      <StoreItemPreview item={item} />
      <div className={styles.copy}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>
      </div>
      {action}
    </article>
  );
}
