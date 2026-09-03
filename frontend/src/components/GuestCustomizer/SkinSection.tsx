import classNames from "classnames";
import { useTranslation } from "react-i18next";

import SkinPreview from "@/components/SkinPreview";
import type { CardSize } from "@/lib/cards/cardSizing";

import styles from "@/styles/GuestCustomizer.module.scss";

import { SkinOption, skinOptions } from "./constants";

interface SkinSectionProps {
  skin: SkinOption;
  onSelectSkin: (skin: SkinOption) => void;
  /** Rótulo do grupo; padrão `Home.chooseCardSkin`. */
  label?: string;
  previewSize?: CardSize;
  /** `dark` para superfícies escuras (modal, sandbox). */
  tone?: "light" | "dark";
}

/** Seletor de baralho (radiogroup) com amostra da realeza de cada skin. */
export default function SkinSection({
  skin,
  onSelectSkin,
  label,
  previewSize = "md",
  tone = "light",
}: SkinSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      className={classNames(styles.formGroup, {
        [styles.dark]: tone === "dark",
      })}
      aria-labelledby="guest-skin-options-label">
      <label id="guest-skin-options-label">
        {label ?? t("Home.chooseCardSkin")}
      </label>
      <div
        className={styles.skinGrid}
        role="radiogroup"
        aria-labelledby="guest-skin-options-label"
        data-testid="skin-section">
        {skinOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            className={classNames(styles.optionButton, styles.skinOption, {
              [styles.selected]: skin === option.value,
            })}
            onClick={() => onSelectSkin(option.value)}
            aria-checked={skin === option.value}
            aria-label={option.name}
            data-testid={`skin-option-${option.value.replaceAll("/", "-")}`}>
            <SkinPreview
              skin={option.value}
              size={previewSize}
            />
            <span className={styles.skinName}>{option.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
