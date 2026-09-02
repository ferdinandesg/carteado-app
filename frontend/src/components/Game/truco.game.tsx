"use client";

import { isTrucoGame } from "shared/game";

import { useGameStore } from "@/contexts/game.store";
import { useGameActions } from "@/hooks/game/useGameActions";
import { usePlayerHand } from "@/hooks/game/usePlayerHand";
import { SeatAnchorProvider } from "@/hooks/game/useSeatAnchors";
import { useTrucoPresentation } from "@/hooks/game/useTrucoPresentation";
import { useTypedGame } from "@/hooks/useTypedGame";
import styles from "@/styles/Game.module.scss";
import { testIds } from "@/tests/testIds";

import CardFan from "../CardFan";
import Table from "../Table";
import TrucoActions from "./truco.actions";
import TrucoDeckArea from "./TrucoDeckArea";
import TrucoHud from "./TrucoHud";
import TrickPile from "./truco/TrickPile";
import TrucoEffects from "./truco/TrucoEffects";
import TrucoTablePresenter from "./truco/TrucoTablePresenter";

const HAND_LAYOUT_PREFIX = "truco-hand";

export default function TrucoGame() {
  const game = useTypedGame(isTrucoGame);
  const userId = useGameStore((state) => state.userId);
  const { playCard } = useGameActions();
  const playerHand = usePlayerHand();
  const presentation = useTrucoPresentation(game);

  const isMyTurn = game?.playerTurn === userId;
  const isTrucoPending = game?.trucoState === "PENDING";

  return (
    <div className={styles.Game}>
      <TrucoHud />

      <SeatAnchorProvider>
        <TrucoEffects effect={presentation.effect}>
          <Table
            game={game}
            deckArea={<TrucoDeckArea />}
            centerArea={
              <TrucoTablePresenter
                bunch={presentation.bunch}
                departing={presentation.departing}
                myUserId={userId}
                layoutPrefix={HAND_LAYOUT_PREFIX}
              />
            }
            actionsArea={<TrucoActions />}
            trickPileOpponent={
              <TrickPile
                side="opponent"
                cards={presentation.piles.opponent}
                tricksWon={presentation.piles.opponentCount}
                testId={testIds.game.trickPileOpponent}
              />
            }
            trickPileOurs={
              <TrickPile
                side="ours"
                cards={presentation.piles.ours}
                tricksWon={presentation.piles.oursCount}
                testId={testIds.game.trickPileOurs}
              />
            }
            highlightedPlayerIds={presentation.respondingPlayerIds}
            handArea={
              <CardFan
                cards={playerHand}
                onClick={playCard}
                disabled={!isMyTurn || isTrucoPending}
                layoutPrefix={HAND_LAYOUT_PREFIX}
                testId={testIds.game.cardFan}
              />
            }
          />
        </TrucoEffects>
      </SeatAnchorProvider>
    </div>
  );
}
