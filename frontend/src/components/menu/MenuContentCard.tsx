"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import classNames from "classnames";

import styles from "@/styles/Menu.module.scss";
import { testIds } from "@/tests/testIds";

export type MenuTab = {
  label: string;
  href?: string;
};

type MenuContentCardProps = {
  tabs: MenuTab[];
  children: ReactNode;
  size?: "default" | "wide";
};

export default function MenuContentCard({
  tabs,
  children,
  size = "default",
}: MenuContentCardProps) {
  const router = useRouter();

  return (
    <div
      className={classNames(styles.gameplayCard, {
        [styles.wideCard]: size === "wide",
      })}>
      <div className={styles.menuCardContent}>
        <nav
          className={styles.cardTabs}
          aria-label={tabs.map((tab) => tab.label).join(" / ")}>
          {tabs.map((tab, index) => {
            const isCurrent = index === tabs.length - 1 || !tab.href;

            if (isCurrent) {
              return (
                <span
                  key={`${tab.label}-${index}`}
                  className={styles.activeTab}
                  aria-current="page"
                  data-testid={testIds.menu.tab(index)}>
                  {tab.label}
                </span>
              );
            }

            return (
              <button
                key={`${tab.label}-${index}`}
                type="button"
                data-testid={testIds.menu.tab(index)}
                onClick={() => {
                  if (tab.href) router.push(tab.href);
                }}>
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className={styles.menuCardBody}>{children}</div>
      </div>
    </div>
  );
}
