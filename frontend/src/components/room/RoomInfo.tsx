"use client";

import { useEffect, useState } from "react";
import classNames from "classnames";
import { Check, Copy, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RoomInterface } from "shared/types";

import styles from "@/styles/RoomInfo.module.scss";
import { testIds } from "@/tests/testIds";

type RoomInfoProps = {
  room: RoomInterface;
};

/** Código da sala (ação principal: compartilhar) + modo, status e dono. */
export default function RoomInfo({ room }: RoomInfoProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const ownerName = room.owner?.name ?? room.ownerId ?? "-";

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyHash = async () => {
    try {
      await navigator.clipboard?.writeText(room.hash);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className={styles.roomInfo}
      aria-label={t("RoomInfo.title")}
      data-testid={testIds.room.info}>
      <h2 className={styles.roomTitle}>{t("RoomInfo.title")}</h2>

      <button
        type="button"
        className={classNames(styles.hashButton, { [styles.copied]: copied })}
        onClick={copyHash}
        aria-label={t("RoomInfo.copy")}
        data-testid={testIds.room.copyHash}>
        <span className={styles.hashLabel}>{t("RoomInfo.hash")}</span>
        <span className={styles.hashValue}>{room.hash}</span>
        <span
          className={styles.hashIcon}
          aria-hidden>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </span>
        <span
          className={styles.copyFeedback}
          role="status">
          {copied ? t("RoomInfo.copied") : ""}
        </span>
      </button>

      <ul className={styles.pills}>
        <li className={classNames(styles.pill, styles[room.status])}>
          <span className={styles.pillLabel}>{t("RoomItem.status")}</span>
          <span className={styles.pillValue}>
            {t(`RoomItem.${room.status}`)}
          </span>
        </li>
        <li className={styles.pill}>
          <span className={styles.pillLabel}>{t("RoomItem.rule")}</span>
          <span className={styles.pillValue}>{t(`RoomItem.${room.rule}`)}</span>
        </li>
        <li className={styles.pill}>
          <span className={styles.pillLabel}>
            <Crown
              size={12}
              aria-hidden
            />
            {t("RoomInfo.owner")}
          </span>
          <span
            className={styles.pillValue}
            title={ownerName}>
            {ownerName}
          </span>
        </li>
      </ul>
    </section>
  );
}
