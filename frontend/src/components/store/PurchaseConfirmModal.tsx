"use client";

import { Coins } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CatalogItem } from "shared/types";

import ActionButton from "@/components/buttons/ActionButton";
import Modal from "@/components/Modal";
import { StoreItemPreview } from "@/components/store/StoreItem";

import styles from "@/styles/Shop.module.scss";

type PurchaseConfirmModalProps = {
  item: CatalogItem | null;
  cash: number;
  isPending: boolean;
  /** Código de erro da última tentativa (`Store.errors.*`). */
  errorCode: string | null;
  onConfirm: (item: CatalogItem) => void;
  onClose: () => void;
};

/** Confirmação simples: item, preço e quanto sobra. */
export default function PurchaseConfirmModal({
  item,
  cash,
  isPending,
  errorCode,
  onConfirm,
  onClose,
}: PurchaseConfirmModalProps) {
  const { t } = useTranslation();
  if (!item) return null;

  const remaining = cash - item.price;
  const canAfford = remaining >= 0;

  return (
    <Modal.Root
      className={styles.confirmPanel}
      data-testid="store-confirm">
      <Modal.Header
        title={t("Store.confirmTitle")}
        onClose={onClose}
      />
      <Modal.Content>
        <div className={styles.confirmBody}>
          <StoreItemPreview item={item} />
          <strong className={styles.confirmName}>{item.name}</strong>
          <dl className={styles.confirmSummary}>
            <div>
              <dt>{t("Store.price")}</dt>
              <dd>
                <Coins
                  size={16}
                  aria-hidden
                />
                {item.price}
              </dd>
            </div>
            <div>
              <dt>{t("Store.balanceAfter")}</dt>
              <dd className={canAfford ? undefined : styles.negative}>
                <Coins
                  size={16}
                  aria-hidden
                />
                {remaining}
              </dd>
            </div>
          </dl>
          {(errorCode || !canAfford) && (
            <p
              className={styles.error}
              role="alert">
              {t(`Store.errors.${errorCode ?? "INSUFFICIENT_FUNDS"}`, {
                defaultValue: t("Store.errors.STORE_REQUEST_FAILED"),
              })}
            </p>
          )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}>
          {t("cancel")}
        </ActionButton>
        <ActionButton
          type="button"
          variant="primary"
          size="sm"
          disabled={!canAfford}
          isLoading={isPending}
          onClick={() => onConfirm(item)}>
          {t("Store.confirmBuy")}
        </ActionButton>
      </Modal.Footer>
    </Modal.Root>
  );
}
