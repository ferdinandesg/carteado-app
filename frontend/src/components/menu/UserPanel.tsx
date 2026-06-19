"use client";

import Image from "next/image";

import RankMeter from "@/components/RankMeter";
import UserPlaceholder from "@/components/UserPlaceholder";
import styles from "@/styles/UserPanel.module.scss";
import { Pencil } from "lucide-react";

type UserPanelProps = {
  userName: string;
  userRank: number;
  playerLevel: number;
  userImage?: string | null;
  levelLabel: string;
  statisticsLabel: string;
  rulesAriaLabel: string;
  onOpenRules: () => void;
};

export default function UserPanel({
  userName,
  userRank,
  playerLevel,
  userImage,
  levelLabel,
  statisticsLabel,
  rulesAriaLabel,
  onOpenRules,
}: UserPanelProps) {
  return (
    <aside
      className={styles.sidebar}
      aria-label={userName}>
      <div />
      <div className={styles.profileContainer}>
        <div className={styles.profileAvatar}>
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={112}
              height={112}
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>

        <div className={styles.profileName}>
          <h1>{userName}</h1>
          <Pencil
            size={24}
            aria-hidden
          />
        </div>
        <span className={styles.levelBadge}>{levelLabel}</span>

        <RankMeter
          currentValue={userRank}
          size={34}
        />

        <button
          type="button"
          className={styles.statsButton}>
          {">"} {statisticsLabel}
        </button>
      </div>

      <button
        type="button"
        className={styles.helpButton}
        aria-label={rulesAriaLabel}
        onClick={onOpenRules}>
        ?
      </button>
    </aside>
  );
}
