import styles from "@styles/Game.module.scss";
import Table from "../Table";
import { useGameStore } from "@/contexts/game.store";
import TrucoHud from "./TrucoHud";
import CardFan from "../CardFan";
import Card from "../Card";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import CardBunch from "../CardBunch";

const DeckArea = () => {
    const { t } = useTranslation();
    const { game } = useGameStore();
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
    const { game } = useGameStore();
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
    const { game } = useGameStore();
    const isTrucoPending = game?.trucoAskedBy && !game?.trucoAcceptedBy;
    const isCurrentUserTurn = game?.playerTurn === data?.user?.id;
    const userTeam = game?.teams.find(t => t.userIds.includes(data?.user?.id))
    const hasAskedTruco = game?.trucoAskedBy && userTeam?.userIds.includes(game.trucoAskedBy);
    const canAskTruco = isCurrentUserTurn && !isTrucoPending && !hasAskedTruco;
    if (isTrucoPending) {
        return (
            <div className={styles.actionsArea}>
                <button>{t("Game.acceptTruco")}</button>
                <button>{t("Game.rejectTruco")}</button>
            </div>
        )
    }
    return (
        <div className={styles.actionsArea}>
            <button disabled={!canAskTruco}>{t("Game.askTruco")}</button>
        </div>
    )
}


const HandResultsArea = () => {
    const { game } = useGameStore();
    if (!game) return null;
    const handResults = game.handsResults.filter(r => r.round === game.currentBet)
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
                deckArea={<DeckArea />}
                playedCardsArea={<BunchCardsArea />}
                actionsAreaLeft={<TrucoActions />}
                actionsAreaRight={<HandResultsArea />}
            />

            <CardFan cards={playerHand} onClick={playCard} />
        </div>
    );
}