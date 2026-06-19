import classNames from "classnames";
import { ReactNode } from "react";

import styles from "@/styles/Game.module.scss";

type GameActionPanelProps = {
  children: ReactNode;
  className?: string;
  layout?: "column" | "row" | "truco";
};

export default function GameActionPanel({
  children,
  className,
  layout = "column",
}: GameActionPanelProps) {
  return (
    <div className={classNames(styles.actionPanel, styles[layout], className)}>
      {children}
    </div>
  );
}
