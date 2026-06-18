import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "@/styles/GuestCustomizer.module.scss";

interface GuestCustomizerActionsProps {
  canApply: boolean;
  isLoading: boolean;
  onReset: () => void;
  onApply: () => void;
}

export default function GuestCustomizerActions({
  canApply,
  isLoading,
  onReset,
  onApply,
}: GuestCustomizerActionsProps) {
  const { t } = useTranslation();

  return (
    <footer className={styles.actions}>
      <button
        type="button"
        className={styles.resetButton}
        onClick={onReset}
        disabled={isLoading}
        data-testid="guest-reset-button">
        {t("Home.reset")}
      </button>

      <button
        type="button"
        className={styles.createButton}
        onClick={onApply}
        disabled={!canApply || isLoading}
        aria-busy={isLoading}
        data-testid="guest-play-button">
        {isLoading ? (
          <span
            className="spinner"
            aria-hidden
          />
        ) : (
          <Check size={18} />
        )}
        {t("Home.apply")}
      </button>
    </footer>
  );
}
