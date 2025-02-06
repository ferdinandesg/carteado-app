import styles from "@styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import { withSound } from "../buttons/withSound";
import { useGameContext } from "@/contexts/game.context";
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

export default function TrucoActions() {
    const { askTruco, rejectTruco, acceptTruco } = useGameContext();
    const { t } = useTranslation()

    return <div className={styles.trucoActions}>
        <div className={styles.acceptReject}>
            <ButtonWithSound
                onClick={acceptTruco}
                text={t("TableActions.accept")}
                clickSrc="/assets/sfx/hurt.mp3"
            />
            <ButtonWithSound
                onClick={rejectTruco}
                text={t("TableActions.reject")}
                clickSrc="/assets/sfx/hurt.mp3"
            />
        </div>
        <ButtonWithSound
            onClick={askTruco}
            text={t("TableActions.truco")}
            clickSrc="/assets/sfx/your-turn.mp3"
        />
    </div>
}