import { ArrowLeftCircle } from "lucide-react";
import { withSound } from "./withSound";

import styles from "@styles/Buttons.module.scss";
import { ButtonHTMLAttributes } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

type BackButtonType = {
  size: number;
  color?: "light" | "dark" | "white";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = ({ size, color = "light", ...props }: BackButtonType) => {
  const { t } = useTranslation()
  return (
    <button
      className={classNames(styles.BackButton, styles[color])}
      {...props}>
      <ArrowLeftCircle size={size} />
      <span>{t("back")}</span>
    </button>
  );
};

export default withSound(BackButton, {
  clickSrc: "/assets/sfx/button-hover.mp3",
});
