import classNames from "classnames"
import styles from "@/styles/Opponent.module.scss";
import UserPlaceholder from "../UserPlaceholder"
import Image from "next/image"
import { BasePlayer, isTrucoGame } from "shared/game";
import { useTypedGame } from "@/hooks/useTypedGame";

type TrucoOpponentProps = {
    player: BasePlayer;
    onAccept?: () => void;
    onReject?: () => void;
}
export default function TrucoOpponent({ player, onAccept, onReject }: TrucoOpponentProps) {
    const game = useTypedGame(isTrucoGame);
    const isCurrentPlayerTurn = game?.playerTurn === player.userId;
    const teamId = game?.teams.find((team) => team.userIds.includes(player.userId))?.id || ""
    const trucoAskedBy = game?.trucoAskerId === player.userId;

    return (
        <div
            className={classNames(
                styles.Opponent,
                styles[teamId]
            )}>
            {trucoAskedBy && <div className={styles.trucoAskedBy}></div>}
            {player.image ? (
                <Image
                    className={classNames(
                        styles.avatar,
                        { [styles.isCurrentPlayerTurn]: isCurrentPlayerTurn }
                    )}
                    src={player.image}
                    alt={player.name || "opponent avatar"}
                    width={150}
                    height={100}
                />
            ) : (
                <UserPlaceholder />
            )}
            <p className={styles.name}>
                {player.name} ({player.hand.length})
            </p>
        </div>
    );
}