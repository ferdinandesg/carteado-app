"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import styles from "@/styles/Menu.module.scss";
import FriendsPanel, { MenuFriend } from "@/components/menu/FriendsPanel";
import MenuContentCard from "@/components/menu/MenuContentCard";
import MenuTopBar from "@/components/menu/MenuTopBar";
import UserPanel from "@/components/menu/UserPanel";
import ActionButton from "../buttons/ActionButton";
import { testIds } from "@/tests/testIds";

type MenuShellProps = {
  activeTabLabel: string;
  children: ReactNode;
  contentSize?: "default" | "wide";
};

export default function MenuShell({
  activeTabLabel,
  children,
  contentSize = "default",
}: MenuShellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data } = useSession();
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const user = data?.user;
  const playerLevel = user?.xp || 0;
  const playerXp = user?.xp || 0;
  const playerGold = user?.cash || 0;
  const userName = user?.name || "Player 0101";
  const userRank = user?.rank || 0;
  const friends: MenuFriend[] = [
    { name: userName, status: "online", image: user?.image },
    { name: "Player 0101", status: "offline" },
  ];

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
        levelLabel={t("Menu.level", { level: playerLevel })}
        statisticsLabel={t("Menu.statistics")}
        rulesAriaLabel={t("seeRules")}
        onOpenRules={() => router.push("/rules")}
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
          settingsAriaLabel="Settings"
          friendsLabel={t("Menu.friends")}
          isFriendsOpen={isFriendsOpen}
          onToggleFriends={() => setIsFriendsOpen((open) => !open)}
        />

        <MenuContentCard
          activeTabLabel={activeTabLabel}
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
        friends={friends}
        title={t("Menu.friends")}
        searchPlaceholder={t("Menu.searchFriends")}
      />
    </main>
  );
}
