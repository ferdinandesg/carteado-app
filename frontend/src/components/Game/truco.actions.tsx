import styles from "@styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import { withSound } from "../buttons/withSound";
import { useGameContext } from "@/contexts/game.context";
import { useSession } from "next-auth/react";
import { useGameStore } from "@/contexts/game.store";
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
    const { askTruco, rejectTruco, acceptTruco, game } = useGameStore();
    const { t } = useTranslation()

    const myTeam = game?.teams.find(team => team.userIds.includes(data?.user.id || "-"))
    const isTrucoPending = Boolean(game?.trucoAskedBy && !game?.trucoAcceptedBy)
    const isTrucoAskedByMyTeam = myTeam?.userIds.includes(game?.trucoAskedBy || "")
    const isTrucoPendingByMyTeam = isTrucoAskedByMyTeam && !game?.trucoAcceptedBy

    const canAcceptReject = isTrucoPending && !isTrucoAskedByMyTeam

    const canAskTruco = !isTrucoAskedByMyTeam && !isTrucoPendingByMyTeam

    return <div className={styles.trucoActions}>
        <div className={styles.acceptReject}>
            <ButtonWithSound
                onClick={acceptTruco}
                disabled={!canAcceptReject}
                text={t("TableActions.accept")}
                clickSrc="/assets/sfx/hurt.mp3"
            />
            <ButtonWithSound
                onClick={rejectTruco}
                disabled={!canAcceptReject}
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