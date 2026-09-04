"use client";

import { Coins, Plus, Settings, ShoppingBag, Users } from "lucide-react";

import styles from "@/styles/Menu.module.scss";
import ActionButton from "../buttons/ActionButton";
import { testIds } from "@/tests/testIds";
import { useTranslation } from "react-i18next";

type MenuTopBarProps = {
  playerLevel: number;
  playerXp: number;
  playerGold: string | number;
  xpLabel: string;
  goldAriaLabel: string;
  shopLabel: string;
  settingsAriaLabel: string;
  friendsLabel: string;
  isFriendsOpen: boolean;
  onToggleFriends: () => void;
  onOpenSettings: () => void;
  onOpenShop: () => void;
};

export default function MenuTopBar({
  playerLevel,
  playerXp,
  playerGold,
  xpLabel,
  goldAriaLabel,
  shopLabel,
  settingsAriaLabel,
  friendsLabel,
  isFriendsOpen,
  onToggleFriends,
  onOpenSettings,
  onOpenShop,
}: MenuTopBarProps) {
  const playerLevelOrMax = 100 > 100 ? "+99" : playerLevel;
  return (
    <header className={styles.topBar}>
      <div className={styles.xpWidget}>
        <span className={styles.hexBadge}>{playerLevelOrMax}</span>
        <div
          className={styles.xpTrack}
          aria-label={`${xpLabel} ${playerXp}%`}>
          <span style={{ width: `${playerXp}%` }} />
        </div>
      </div>

      <div className={styles.wallet}>
        <span>
          <Coins
            size={28}
            aria-hidden
          />
          <strong>{playerGold}</strong>
        </span>
        <ActionButton
          type="button"
          variant="primary"
          disabled
          size="sm"
          icon={<Plus size={15} />}
          aria-label={goldAriaLabel}
        />
      </div>

      <button
        type="button"
        className={styles.shopButton}
        onClick={onOpenShop}>
        <ShoppingBag
          size={22}
          aria-hidden
        />
        {shopLabel}
      </button>

      <button
        type="button"
        className={styles.settingsButton}
        aria-label={settingsAriaLabel}
        onClick={onOpenSettings}>
        <Settings
          size={30}
          aria-hidden
        />
      </button>
    </header>
  );
}
