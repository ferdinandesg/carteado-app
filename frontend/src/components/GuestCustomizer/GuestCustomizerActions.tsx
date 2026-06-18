import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import ActionButton from "@/components/buttons/ActionButton";
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
      <ActionButton
        type="button"
        variant="ghost"
        onClick={onReset}
        disabled={isLoading}
        data-testid="guest-reset-button">
        {t("Home.reset")}
      </ActionButton>

      <ActionButton
        type="button"
        className={styles.applyButton}
        icon={<Check size={18} />}
        onClick={onApply}
        disabled={!canApply || isLoading}
        isLoading={isLoading}
        data-testid="guest-play-button">
        {t("Home.apply")}
      </ActionButton>
    </footer>
  );
}
