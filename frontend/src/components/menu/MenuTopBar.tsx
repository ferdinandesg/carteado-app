"use client";

import { Coins, Plus, Settings, ShoppingBag } from "lucide-react";

import styles from "@/styles/Menu.module.scss";
import ActionButton from "../buttons/ActionButton";
import { useTranslation } from "react-i18next";

type MenuTopBarProps = {
  playerLevel: number;
  playerXp: number;
  playerGold: string;
  xpLabel: string;
  goldAriaLabel: string;
  shopLabel: string;
  settingsAriaLabel: string;
};

export default function MenuTopBar({
  playerLevel,
  playerXp,
  playerGold,
  xpLabel,
  goldAriaLabel,
  shopLabel,
  settingsAriaLabel,
}: MenuTopBarProps) {
  const { t } = useTranslation();
  return (
    <header className={styles.topBar}>
      <div className={styles.xpWidget}>
        <span className={styles.hexBadge}>{playerLevel}</span>
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
          aria-label={goldAriaLabel}>
          {t("Menu.addGold")}
        </ActionButton>
      </div>

      <button
        type="button"
        className={styles.shopButton}>
        <ShoppingBag
          size={22}
          aria-hidden
        />
        {shopLabel}
      </button>

      <button
        type="button"
        className={styles.settingsButton}
        aria-label={settingsAriaLabel}>
        <Settings
          size={30}
          aria-hidden
        />
      </button>
    </header>
  );
}
