import { useTypedGame } from "@/hooks/useTypedGame";
import Table from "../Table";
import { isCarteadoGame } from "shared/game";
import styles from "@/styles/carteado.table.module.scss";
import CardBunch from "../CardBunch";
import { useTranslation } from "react-i18next";
import { useGameStore } from "@/contexts/game.store";

const RemainingCardsArea = () => {
    const game = useTypedGame(isCarteadoGame);
    if (!game) return null;
    const deck = game.deck.cards
    return (
        <div className={styles.deckAreaContainer}>
            <div className={styles.deckItem}>
                <CardBunch isHidden spacing="compact" cards={deck.slice(0, 10) || []} cardHeight={150} />
                <span className={styles.deckCount}>{deck.length}</span>
            </div>
        </div>
    );
};

const CarteadoActionsArea = () => {
    const { t } = useTranslation()
    const { endTurn, pickUpBunch } = useGameStore();
    return (
        <div className={styles.actionsArea}>
            <button
                className={styles.pickup}
                onClick={pickUpBunch}
            >
                {t("TableActions.pickUpBunch")}
            </button>
            <button
                onClick={endTurn}
            >
                {t("TableActions.endTurn")}
            </button>
        </div>
    );
}


const BunchCardsArea = () => {
    const game = useTypedGame(isCarteadoGame);
    if (!game) return null;

    return (
        <div className={styles.playedCards}>
            <CardBunch cards={game.bunch || []} cardHeight={180} canHover />
        </div>
    );
};

export default function CarteadoTable() {
    const game = useTypedGame(isCarteadoGame);

    return <Table
        game={game}
        deckArea={null}
        playedCardsArea={<BunchCardsArea />}
        actionsAreaLeft={<RemainingCardsArea />}
        actionsAreaRight={<CarteadoActionsArea />}
    />
}