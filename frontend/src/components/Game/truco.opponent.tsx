import { useGameContext } from "@/contexts/game.context"
import classNames from "classnames"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Player } from "shared/types"
import styles from "@styles/Opponent.module.scss";
import UserPlaceholder from "../UserPlaceholder"
import Image from "next/image"

type TrucoOpponentProps = {
    player: Player
}
export default function TrucoOpponent({ player }: TrucoOpponentProps) {
    const { data } = useSession()
    const { game } = useGameContext();
    const isCurrentPlayerTurn = game?.playerTurn === player.userId;

    return (
        <div
            className={classNames(
                styles.Opponent,
                isCurrentPlayerTurn && styles.isCurrentPlayerTurn
            )}>
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