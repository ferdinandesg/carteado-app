import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "@/styles/GuestCustomizer.module.scss";

interface GuestCustomizerHeaderProps {
  onBack: () => void;
}

export default function GuestCustomizerHeader({
  onBack,
}: GuestCustomizerHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <span
        className={styles.headerSpacer}
        aria-hidden
      />

      <h1 className={styles.title}>{t("Home.customizeProfileTitle")}</h1>

      <button
        type="button"
        className={styles.closeButton}
        onClick={onBack}
        aria-label={t("back")}
        data-testid="back-button">
        <X size={30} />
      </button>
    </header>
  );
}
