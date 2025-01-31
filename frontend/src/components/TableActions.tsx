import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/Game.module.scss";
import { withSound } from "./buttons/withSound";
import { useTranslation } from "react-i18next";

type ButtonProps = {
  onClick: () => void;
  text: string;
};

const Button = ({ onClick, text }: ButtonProps) => (
  <button onClick={onClick}>{text}</button>
);

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

export default function TableActions() {
  const { t } = useTranslation()
  const { game, endTurn, drawTable } = useGameContext();
  const isGameStarted = game?.status === "playing";
  if (!isGameStarted) return;
  return (
    <div className={styles.actions}>
      <ButtonWithSound
        onClick={drawTable}
        text={t("TableActions.drawTable")}
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
