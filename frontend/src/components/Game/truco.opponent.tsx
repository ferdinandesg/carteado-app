import { useGameContext } from "@/contexts/game.context"
import classNames from "classnames"
import { PlayerWithUser } from "shared/types"
import styles from "@styles/Opponent.module.scss";
import UserPlaceholder from "../UserPlaceholder"
import Image from "next/image"

type TrucoOpponentProps = {
    player: PlayerWithUser
}
export default function TrucoOpponent({ player }: TrucoOpponentProps) {
    const { game } = useGameContext();
    const isCurrentPlayerTurn = game?.playerTurn === player.userId;
    const teamId = game?.teams.find((team) => team.userIds.includes(player.userId))?.id || ""
    const trucoAskedBy = game?.trucoAskedBy === player.userId;
    return (
        <div
            className={classNames(
                styles.Opponent,
                isCurrentPlayerTurn && styles.isCurrentPlayerTurn,
                styles[teamId]
            )}>
            {trucoAskedBy && <div className={styles.trucoAskedBy}></div>}
            {player.user.image ? (
                <Image
                    src={player.user.image}
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