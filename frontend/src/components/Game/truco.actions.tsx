import styles from "@styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import { withSound } from "../buttons/withSound";
import { useGameContext } from "@/contexts/game.context";
import { useSession } from "next-auth/react";
type ButtonProps = {
    onClick: () => void;
    text: string;
    disabled?: boolean
};

const ButtonWithSound = ({
    clickSrc,
    text,
    onClick,
    disabled
}: ButtonProps & {
    clickSrc: string;
}) => {
    const Element = withSound(Button, { clickSrc });
    return (
        <Element
            onClick={onClick}
            text={text}
            disabled={disabled}
        />
    );
};

const Button = ({ onClick, text, disabled }: ButtonProps) => (
    <button disabled={disabled} onClick={onClick}>{text}</button>
);

export default function TrucoActions() {
    const { data } = useSession();
    const { askTruco, rejectTruco, acceptTruco, game } = useGameContext();
    const { t } = useTranslation()

    const isTrucoPending = game?.trucoAskedBy && !game?.trucoAcceptedBy
    const isTrucoAskedByMyTeam = game?.teams.some(team =>
        team.userIds.includes(game.trucoAskedBy) &&
        team.userIds.includes(data?.user.id || "-")
    )

    const canAskTruco = game?.playerTurn === data?.user.id && !isTrucoPending && !isTrucoAskedByMyTeam

    return <div className={styles.trucoActions}>
        <div className={styles.acceptReject}>
            <ButtonWithSound
                onClick={acceptTruco}
                disabled={!isTrucoPending}
                text={t("TableActions.accept")}
                clickSrc="/assets/sfx/hurt.mp3"
            />
            <ButtonWithSound
                onClick={rejectTruco}
                disabled={!isTrucoPending}
                text={t("TableActions.reject")}
                clickSrc="/assets/sfx/hurt.mp3"
            />
        </div>
        <ButtonWithSound
            onClick={askTruco}
            text={t("TableActions.truco")}
            disabled={!canAskTruco}
            clickSrc="/assets/sfx/your-turn.mp3"
        />
    </div>
}