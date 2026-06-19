import { ArrowLeftCircle } from "lucide-react";

import ActionButton from "@/components/buttons/ActionButton";
import styles from "@/styles/Buttons.module.scss";
import { ButtonHTMLAttributes } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

type BackButtonType = {
  size: number;
  color?: "light" | "dark" | "white";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = ({
  size,
  color = "light",
  className,
  ...props
}: BackButtonType) => {
  const { t } = useTranslation();

  return (
    <ActionButton
      variant="ghost"
      size="sm"
      icon={<ArrowLeftCircle size={size} />}
      className={classNames(styles.BackButton, styles[color], className)}
      {...props}>
      {t("back")}
    </ActionButton>
  );
};

export default BackButton;
