import styles from "@styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import { withSound } from "../buttons/withSound";
import { useSession } from "next-auth/react";
import { useGameStore } from "@/contexts/game.store";
type ButtonProps = {
    onClick: () => void;
    text: string;
    disabled?: boolean
};

const Button = ({ onClick, text, disabled }: ButtonProps) => (
    <button disabled={disabled} onClick={onClick}>{text}</button>
);

const AcceptButton = withSound(Button, { clickSrc: "/assets/sfx/hurt.mp3" });
const RejectButton = withSound(Button, { clickSrc: "/assets/sfx/hurt.mp3" });
const TrucoButton = withSound(Button, { clickSrc: "/assets/sfx/your-turn.mp3" });

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
            <AcceptButton
                onClick={acceptTruco}
                disabled={!canAcceptReject}
                text={t("TableActions.accept")}
            />
            <RejectButton
                onClick={rejectTruco}
                disabled={!canAcceptReject}
                text={t("TableActions.reject")}
            />
        </div>
        <TrucoButton
            onClick={askTruco}
            text={t("TableActions.truco")}
            disabled={!canAskTruco}
        />
    </div>
}