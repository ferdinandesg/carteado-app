import Card from "@/components/Card";
import { useTypedGame } from "@/hooks/useTypedGame";
import styles from "@/styles/Game.module.scss";
import { isTrucoGame } from "shared/game";
import { useTranslation } from "react-i18next";

export default function TrucoDeckArea() {
  const { t } = useTranslation();
  const game = useTypedGame(isTrucoGame);

  if (!game) return null;

  return (
    <div className={styles.deckAreaContainer}>
      {game.vira && (
        <div className={styles.deckItem}>
          <Card
            size="md"
            card={game.vira}
          />
          <span className={styles.deckLabel}>{t("Game.vira")}</span>
        </div>
      )}
    </div>
  );
}
