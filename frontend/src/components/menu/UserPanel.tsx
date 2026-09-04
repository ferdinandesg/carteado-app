"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";

import RankMeter from "@/components/RankMeter";
import SkinPreview from "@/components/SkinPreview";
import UserPlaceholder from "@/components/UserPlaceholder";
import styles from "@/styles/UserPanel.module.scss";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type UserPanelProps = {
  userName: string;
  userRank: number;
  playerLevel: number;
  userImage?: string | null;
  /** `assetKey` do baralho em uso. */
  userSkin: string;
  levelLabel: string;
  deckLabel: string;
  editAvatarLabel: string;
  editDeckLabel: string;
  statisticsLabel: string;
  rulesAriaLabel: string;
  onOpenRules: () => void;
  /** Ausentes para convidados (não têm loadout). */
  onEditAvatar?: () => void;
  onEditDeck?: () => void;
};

export default function UserPanel({
  userName,
  userRank,
  playerLevel,
  userImage,
  userSkin,
  levelLabel,
  deckLabel,
  editAvatarLabel,
  editDeckLabel,
  statisticsLabel,
  rulesAriaLabel,
  onOpenRules,
  onEditAvatar,
  onEditDeck,
}: UserPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <aside
      className={styles.sidebar}
      aria-label={userName}>
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
          {onEditAvatar && (
            <button
              type="button"
              className={styles.editBadge}
              aria-label={editAvatarLabel}
              data-testid="edit-avatar"
              onClick={onEditAvatar}>
              <Pencil
                size={16}
                aria-hidden
              />
            </button>
          )}
        </div>

        <div className={styles.profileName}>
          <h1>{userName}</h1>
        </div>

        <section
          className={styles.deckSection}
          aria-label={deckLabel}>
          <span className={styles.deckLabel}>{deckLabel}</span>
          <div className={styles.deckPreview}>
            <SkinPreview
              skin={userSkin}
              size={isMobile ? "md" : "lg"}
            />
            {onEditDeck && (
              <button
                type="button"
                className={styles.editBadge}
                aria-label={editDeckLabel}
                data-testid="edit-deck"
                onClick={onEditDeck}>
                <Pencil
                  size={16}
                  aria-hidden
                />
              </button>
            )}
          </div>
        </section>
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
