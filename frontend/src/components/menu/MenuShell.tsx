"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import type { ProductType } from "shared/types";

import styles from "@/styles/Menu.module.scss";
import FriendsPanel from "@/components/menu/FriendsPanel";
import MenuContentCard, {
  type MenuTab,
} from "@/components/menu/MenuContentCard";
import MenuTopBar from "@/components/menu/MenuTopBar";
import UserPanel from "@/components/menu/UserPanel";
import ActionButton from "../buttons/ActionButton";
import CosmeticPickerModal from "@/components/Modal/CosmeticPickerModal/CosmeticPickerModal";
import { resolveSkin } from "@/components/GuestCustomizer/constants";
import { testIds } from "@/tests/testIds";

type MenuShellProps = {
  tabs: MenuTab[];
  children: ReactNode;
  contentSize?: "default" | "wide";
};

export default function MenuShell({
  tabs,
  children,
  contentSize = "default",
}: MenuShellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data } = useSession();
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [picker, setPicker] = useState<ProductType | null>(null);
  const user = data?.user;
  const playerLevel = user?.xp || 0;
  const playerXp = user?.xp || 0;
  const playerGold = user?.cash || 0;
  const userName = user?.name || "Player 0101";
  const userRank = user?.rank || 0;
  // Convidados escolhem skin/avatar no login e não têm loadout no servidor.
  const canEditCosmetics = Boolean(user) && user?.role !== "guest";

  return (
    <main
      className={classNames(styles.Menu, {
        [styles.friendsOpen]: isFriendsOpen,
      })}
      data-testid={testIds.menu.shell}>
      <UserPanel
        userName={userName}
        userRank={userRank}
        playerLevel={playerLevel}
        userImage={user?.image}
        userSkin={resolveSkin(user?.skin)}
        levelLabel={t("Menu.level", { level: playerLevel })}
        deckLabel={t("Menu.deck")}
        editAvatarLabel={t("Menu.editAvatar")}
        editDeckLabel={t("Menu.editDeck")}
        statisticsLabel={t("Menu.statistics")}
        rulesAriaLabel={t("seeRules")}
        onOpenRules={() => router.push("/rules")}
        onEditAvatar={canEditCosmetics ? () => setPicker("AVATAR") : undefined}
        onEditDeck={canEditCosmetics ? () => setPicker("DECK") : undefined}
      />

      <section
        className={styles.mainPanel}
        data-testid={testIds.menu.content}>
        <MenuTopBar
          playerLevel={playerLevel}
          playerXp={playerXp}
          playerGold={playerGold}
          xpLabel={t("Menu.xp")}
          goldAriaLabel={t("Menu.gold")}
          shopLabel={t("Menu.shop")}
          settingsAriaLabel={t("Settings.title")}
          friendsLabel={t("Menu.friends")}
          isFriendsOpen={isFriendsOpen}
          onToggleFriends={() => setIsFriendsOpen((open) => !open)}
          onOpenSettings={() => setPicker("DECK")}
          onOpenShop={() => router.push("/shop")}
        />

        <MenuContentCard
          tabs={tabs}
          size={contentSize}>
          {children}
        </MenuContentCard>

        <div className={styles.panelFooter}>
          <span>{t("Menu.version")}</span>
          <ActionButton
            type="button"
            variant="primary"
            disabled
            size="sm"
            icon={<History size={20} />}
            aria-label={t("Menu.history")}>
            {t("Menu.history")}
          </ActionButton>
        </div>
      </section>

      <FriendsPanel
        title={t("Menu.friends")}
        searchPlaceholder={t("Menu.searchFriends")}
      />

      {picker && (
        <CosmeticPickerModal
          type={picker}
          onClose={() => setPicker(null)}
        />
      )}
    </main>
  );
}
