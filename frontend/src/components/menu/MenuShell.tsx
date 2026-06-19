"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "@/styles/Menu.module.scss";
import FriendsPanel, { MenuFriend } from "@/components/menu/FriendsPanel";
import MenuContentCard from "@/components/menu/MenuContentCard";
import MenuTopBar from "@/components/menu/MenuTopBar";
import UserPanel from "@/components/menu/UserPanel";
import ActionButton from "../buttons/ActionButton";

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
  const user = data?.user;
  console.log({
    data,
  });
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
    <main className={styles.Menu}>
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

      <section className={styles.mainPanel}>
        <MenuTopBar
          playerLevel={playerLevel}
          playerXp={playerXp}
          playerGold={playerGold}
          xpLabel={t("Menu.xp")}
          goldAriaLabel={t("Menu.gold")}
          shopLabel={t("Menu.shop")}
          settingsAriaLabel="Settings"
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
