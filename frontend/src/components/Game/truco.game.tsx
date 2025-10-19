import styles from "@/styles/Game.module.scss";
import Table from "../Table";
import TrucoHud from "./TrucoHud";
import CardFan from "../CardFan";
import Card from "../Card";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import CardBunch from "../CardBunch";
import { useGameStore } from "@/contexts/game.store";
import { isTrucoGame } from "shared/game";
import { useTypedGame } from "@/hooks/useTypedGame";

const DeckArea = () => {
    const { t } = useTranslation();
    const game = useTypedGame(isTrucoGame);

    if (!game) return null;
    return (
        <div className={styles.deckAreaContainer}>
            {game.vira && (
                <div className={styles.deckItem}>
                    <Card height={150} card={game.vira} />
                    <span className={styles.deckLabel}>{t("Game.vira")}</span>
                </div>
            )}
        </div>
    );
};

const BunchCardsArea = () => {
    const game = useTypedGame(isTrucoGame);
    if (!game) return null;

    return (
        <div className={styles.playedCards}>
            <CardBunch cards={game.bunch || []} cardHeight={180} canHover />
        </div>
    );
};

const TrucoActions = () => {
    const { t } = useTranslation();
    const { data } = useSession();
    const game = useTypedGame(isTrucoGame);

    const { acceptTruco, askTruco, rejectTruco } = useGameStore();
    if (!game) return null;
    const isTrucoPending = game.trucoState === "PENDING";
    const isCurrentUserTurn = game.playerTurn === data?.user?.id;
    const userTeam = game.teams.find(t => t.userIds.includes(data?.user?.id))
    const hasAskedTruco = game.trucoAskerId && userTeam?.userIds.includes(game.trucoAskerId);
    const canAskTruco = isCurrentUserTurn && !isTrucoPending && !hasAskedTruco;
    if (isTrucoPending && !hasAskedTruco) {
        return (
            <div className={styles.actionsArea}>
                <button onClick={acceptTruco}>{t("Game.acceptTruco")}</button>
                <button onClick={rejectTruco}>{t("Game.rejectTruco")}</button>
            </div>
        )
    }
    return (
        <div className={styles.actionsArea}>
            <button onClick={askTruco} disabled={!canAskTruco}>{t("Game.askTruco")}</button>
        </div>
    )
}


const HandResultsArea = () => {
    const game = useTypedGame(isTrucoGame);
    if (!game) return null;
    const lastPlayedRound = game.handsResults.length > 0 ? game.rounds : game.rounds - 1;
    const handResults = game.handsResults.filter(r => r.round === lastPlayedRound)
    const cards = handResults.map(r => r.bunch).flat();
    return (
        <div className={styles.playedCards}>
            <CardBunch direction="right" cards={cards} cardHeight={180} />
        </div>
    );
};

export default function TrucoGame() {
    const { playCard, game } = useGameStore();
    const { data } = useSession();
    const playerHand = game?.players.find(p => p.userId === data?.user?.id)?.hand || [];

    return (
        <div className={styles.Game}>
            <TrucoHud />

            <Table
                game={game}
                deckArea={<DeckArea />}
                playedCardsArea={<BunchCardsArea />}
                actionsAreaLeft={<TrucoActions />}
                actionsAreaRight={<HandResultsArea />}
            />

            <CardFan cards={playerHand} onClick={playCard} />
        </div>
    );
}