import { ButtonHTMLAttributes } from "react";
import { withSound } from "./withSound";

import styles from "@/styles/Buttons.module.scss";

type MenuButtonProps = {
  icon: React.ReactNode;
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function MenuButton({ icon, label, ...props }: MenuButtonProps) {
  return (
    <button
      className={styles.MenuButton}
      {...props}>
      <div className={styles.menuIcon}>{icon}</div>
      <span className={styles.menuLabel}>{label}</span>
    </button>
  );
}

export default withSound(MenuButton, {
  clickSrc: "/assets/sfx/button-click.mp3",
});
