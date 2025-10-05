import classNames from "classnames"
import { Player } from "shared/types"
import styles from "@styles/Opponent.module.scss";
import UserPlaceholder from "../UserPlaceholder"
import Image from "next/image"
import { useGameStore } from "@/contexts/game.store";

type TrucoOpponentProps = {
    player: Player
}
export default function TrucoOpponent({ player }: TrucoOpponentProps) {
    const { game } = useGameStore();
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
            {player.image ? (
                <Image
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