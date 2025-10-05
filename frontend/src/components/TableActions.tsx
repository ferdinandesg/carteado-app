import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/Game.module.scss";
import { withSound } from "./buttons/withSound";
import { useTranslation } from "react-i18next";
import { useGameStore } from "@/contexts/game.store";

type ButtonProps = {
  onClick: () => void;
  text: string;
};

const ButtonWithSound = ({
  clickSrc,
  text,
  onClick,
}: ButtonProps & {
  clickSrc: string;
}) => {
  const Element = withSound(Button, { clickSrc });
  return (
    <Element
      onClick={onClick}
      text={text}
    />
  );
};

const Button = ({ onClick, text }: ButtonProps) => (
  <button onClick={onClick}>{text}</button>
);

export default function TableActions() {
  const { t } = useTranslation()
  const { game, endTurn, pickUpBunch } = useGameStore();

  const isGameStarted = game?.status === "playing";
  if (!isGameStarted) return;
  return (
    <div className={styles.actions}>
      <ButtonWithSound
        onClick={pickUpBunch}
        text={t("TableActions.pickUpBunch")}
        clickSrc="/assets/sfx/hurt.mp3"
      />
      <ButtonWithSound
        onClick={endTurn}
        text={t("TableActions.endTurn")}
        clickSrc="/assets/sfx/your-turn.mp3"
      />
    </div>
  );
}
