"use client";

import { useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import {
  PRODUCT_TYPES,
  type CatalogItem,
  type ProductType,
} from "shared/types";

import BackButton from "@/components/buttons/BackButton";
import MenuShell from "@/components/menu/MenuShell";
import PurchaseConfirmModal from "@/components/store/PurchaseConfirmModal";
import StoreItem from "@/components/store/StoreItem";
import useStore, { getStoreErrorCode } from "@/hooks/store/useStore";
import useTitle from "@/hooks/useTitle";

import styles from "@/styles/Shop.module.scss";

export default function Shop() {
  const { t } = useTranslation();
  useTitle({ title: t("pageTitles.shop") });

  const router = useRouter();
  const { data: session } = useSession();
  const isGuest = session?.user?.role === "guest";
  const {
    catalog,
    itemsOf,
    isLoading,
    isError,
    error,
    buy,
    equip,
    isMutating,
  } = useStore();
  const [tab, setTab] = useState<ProductType>("DECK");
  const [pending, setPending] = useState<CatalogItem | null>(null);

  const items = itemsOf(tab);

  const handleConfirm = (item: CatalogItem) => {
    buy.mutate(item.id, { onSuccess: () => setPending(null) });
  };

  const closeConfirm = () => {
    buy.reset();
    setPending(null);
  };

  return (
    <MenuShell
      activeTabLabel={t("Menu.shop")}
      contentSize="wide">
      <div className={styles.shop}>
        <header className={styles.toolbar}>
          <BackButton
            size={24}
            color="white"
            onClick={() => router.push("/menu")}
          />
          <div
            className={styles.tabs}
            role="tablist"
            aria-label={t("Store.categories")}>
            {PRODUCT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={tab === type}
                className={classNames(styles.tab, {
                  [styles.activeTab]: tab === type,
                })}
                onClick={() => setTab(type)}>
                {t(`Store.types.${type}`)}
              </button>
            ))}
          </div>
        </header>

        {isGuest && <p className={styles.notice}>{t("Store.guestNotice")}</p>}

        {isLoading ? (
          <p className={styles.notice}>{t("loading")}</p>
        ) : isError ? (
          <p
            className={styles.error}
            role="alert">
            {t(`Store.errors.${getStoreErrorCode(error)}`, {
              defaultValue: t("Store.errors.STORE_REQUEST_FAILED"),
            })}
          </p>
        ) : (
          <div
            className={styles.grid}
            role="tabpanel"
            data-testid="store-grid">
            {items.map((item) => (
              <StoreItem
                key={item.id}
                item={item}
                busy={isMutating}
                readOnly={isGuest}
                onBuy={setPending}
                onEquip={(target) => equip.mutate(target.id)}
              />
            ))}
          </div>
        )}
      </div>

      <PurchaseConfirmModal
        item={pending}
        cash={catalog.cash}
        isPending={buy.isPending}
        errorCode={buy.error ? getStoreErrorCode(buy.error) : null}
        onConfirm={handleConfirm}
        onClose={closeConfirm}
      />
    </MenuShell>
  );
}
