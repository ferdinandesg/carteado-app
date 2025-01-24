import { ArrowLeftCircle } from "lucide-react";
import { withSound } from "./withSound";

import styles from "@styles/Buttons.module.scss";
import { ButtonHTMLAttributes } from "react";
import classNames from "classnames";

type BackButtonType = {
  size: number;
  color?: "light" | "dark";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = ({ size, color = "light", ...props }: BackButtonType) => {
  return (
    <button
      className={classNames(styles.BackButton, styles[color])}
      {...props}>
      <ArrowLeftCircle size={size} />
      <span>Voltar</span>
    </button>
  );
};

export default withSound(BackButton, {
  clickSrc: "/assets/sfx/button-hover.mp3",
});
