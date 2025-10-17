import styles from "@styles/Game.module.scss";
import { withSound } from "./buttons/withSound";
import { useTranslation } from "react-i18next";
import { useGameStore } from "@/contexts/game.store";

type ButtonProps = {
  onClick: () => void;
  text: string;
};

const Button = ({ onClick, text }: ButtonProps) => (
  <button onClick={onClick}>{text}</button>
);

const PickUpBunchButton = withSound(Button, { clickSrc: "/assets/sfx/hurt.mp3" });
const EndTurnButton = withSound(Button, { clickSrc: "/assets/sfx/your-turn.mp3" });

export default function TableActions() {
  const { t } = useTranslation()
  const { game, endTurn, pickUpBunch } = useGameStore();

  const isGameStarted = game?.status === "playing";
  if (!isGameStarted) return;
  return (
    <div className={styles.actions}>
      <PickUpBunchButton
        onClick={pickUpBunch}
        text={t("TableActions.pickUpBunch")}
      />
      <EndTurnButton
        onClick={endTurn}
        text={t("TableActions.endTurn")}
      />
    </div>
  );
}
