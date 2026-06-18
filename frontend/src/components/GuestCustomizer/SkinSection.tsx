import classNames from "classnames";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import styles from "@/styles/GuestCustomizer.module.scss";

import { SkinOption, skinOptions } from "./constants";

interface SkinSectionProps {
  skin: SkinOption;
  onSelectSkin: (skin: SkinOption) => void;
}

export default function SkinSection({ skin, onSelectSkin }: SkinSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      className={styles.formGroup}
      aria-labelledby="guest-skin-options-label">
      <label id="guest-skin-options-label">{t("Home.chooseCardSkin")}</label>
      <div
        className={styles.skinGrid}
        role="group"
        aria-labelledby="guest-skin-options-label"
        data-testid="skin-section">
        {skinOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={classNames(styles.optionButton, styles.skinOption, {
              [styles.selected]: skin === option.value,
            })}
            onClick={() => onSelectSkin(option.value)}
            aria-pressed={skin === option.value}
            aria-label={option.name}
            data-testid={`skin-option-${option.value.replaceAll("/", "-")}`}>
            <Image
              src={option.path}
              alt={option.name}
              width={92}
              height={138}
              className={styles.optionItem}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
