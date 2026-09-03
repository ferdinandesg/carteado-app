"use client";

import classNames from "classnames";
import { ShoppingBag, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { CatalogItem, ProductType } from "shared/types";

import ActionButton from "@/components/buttons/ActionButton";
import Modal from "@/components/Modal";
import { StoreItemPreview } from "@/components/store/StoreItem";
import useStore from "@/hooks/store/useStore";

import styles from "@/styles/CosmeticPickerModal.module.scss";

interface CosmeticPickerModalProps {
  type: ProductType;
  onClose: () => void;
}

/**
 * Seletor rápido do que já é seu (baralhos ou avatares). Selecionar aplica
 * na hora; avatar tem a opção extra de voltar para a foto do provedor.
 */
export default function CosmeticPickerModal({
  type,
  onClose,
}: CosmeticPickerModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { itemsOf, equippedOf, equip, unequip, isMutating } = useStore();

  const owned = itemsOf(type).filter((item) => item.owned);
  const equipped = equippedOf(type);
  const canUnequip = type === "AVATAR";

  const select = (item: CatalogItem) => {
    if (item.equipped) return;
    equip.mutate(item.id);
  };

  return (
    <Modal.Root
      className={styles.panel}
      data-testid="cosmetic-picker">
      <Modal.Header
        title={t(`Store.pick.${type}`)}
        onClose={onClose}
      />
      <Modal.Content>
        <div
          className={classNames(styles.grid, styles[type])}
          role="radiogroup"
          aria-label={t(`Store.pick.${type}`)}>
          {canUnequip && (
            <button
              type="button"
              role="radio"
              aria-checked={!equipped}
              className={classNames(styles.option, {
                [styles.selected]: !equipped,
              })}
              disabled={isMutating}
              onClick={() => equipped && unequip.mutate(type)}>
              <span className={styles.providerPhoto}>
                <UserRound size={40} />
              </span>
              <span className={styles.optionName}>
                {t("Store.providerPhoto")}
              </span>
            </button>
          )}
          {owned.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.equipped}
              className={classNames(styles.option, {
                [styles.selected]: item.equipped,
              })}
              disabled={isMutating}
              onClick={() => select(item)}
              data-testid={`cosmetic-option-${item.assetKey}`}>
              <StoreItemPreview item={item} />
              <span className={styles.optionName}>{item.name}</span>
            </button>
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          type="button"
          variant="ghost"
          size="sm"
          icon={<ShoppingBag size={16} />}
          onClick={() => {
            onClose();
            router.push("/shop");
          }}>
          {t("Store.goToShop")}
        </ActionButton>
        <ActionButton
          type="button"
          variant="primary"
          size="sm"
          onClick={onClose}>
          {t("confirm")}
        </ActionButton>
      </Modal.Footer>
    </Modal.Root>
  );
}
