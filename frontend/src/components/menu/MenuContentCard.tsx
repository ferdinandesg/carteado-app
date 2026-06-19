"use client";

import { ReactNode } from "react";
import classNames from "classnames";

import styles from "@/styles/Menu.module.scss";

type MenuContentCardProps = {
  activeTabLabel: string;
  children: ReactNode;
  size?: "default" | "wide";
};

export default function MenuContentCard({
  activeTabLabel,
  children,
  size = "default",
}: MenuContentCardProps) {
  return (
    <div
      className={classNames(styles.gameplayCard, {
        [styles.wideCard]: size === "wide",
      })}>
      <div className={styles.cardTabs}>
        <span className={styles.activeTab}>{activeTabLabel}</span>
        <span aria-hidden />
        <span aria-hidden />
      </div>

      {children}
    </div>
  );
}
