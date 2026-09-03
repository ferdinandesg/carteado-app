import classNames from "classnames";
import { useTranslation } from "react-i18next";

import styles from "@/styles/PowerHint.module.scss";

type PowerHintProps = {
  powerId: string;
  /** `above` (carta) ou `below` (chip de efeito). */
  placement?: "above" | "below";
  /** Força exibição (ex.: carta selecionada por toque). */
  visible?: boolean;
};

/**
 * Tooltip nome + descrição de um poder. Aparece no hover do elemento pai
 * (deve ser filho direto de um elemento `position: relative`).
 */
export default function PowerHint({
  powerId,
  placement = "above",
  visible = false,
}: PowerHintProps) {
  const { t } = useTranslation();
  const name = t(`Powers.${powerId}.name`, { defaultValue: "" });
  const description = t(`Powers.${powerId}.description`, {
    defaultValue: "",
  });
  if (!description) return null;

  return (
    <span
      className={classNames(styles.powerHint, styles[placement], {
        [styles.visible]: visible,
      })}
      role="tooltip">
      <strong>{name}</strong>
      {description}
    </span>
  );
}
