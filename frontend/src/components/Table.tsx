import React from "react";
import classNames from "classnames";
import { BasePlayer, IGameState } from "shared/game";

import Opponent from "@/components/Opponent/Opponent";
import { useTablePlayers } from "@/hooks/game/useTablePlayers";
import {
  SeatAnchorProvider,
  seatAnchor,
  useAnchorRef,
  useSeatAnchors,
} from "@/hooks/game/useSeatAnchors";
import { resolveTableSeats, type SeatSlot } from "@/lib/game/tableLayout";
import { getTeamRelation, resolveTeamId } from "@/lib/game/teamRelation";
import styles from "@/styles/Table.module.scss";
import { testIds } from "@/tests/testIds";

import GameBoard from "./game.board";

/**
 * Mesa 3x3:
 *   1 deck/vira        2 assento            3 pilha do oponente
 *   4 assento          5 centro             6 assento
 *   7 ações            8 eu + leque         9 pilha do meu time
 */
type TableProps = {
  game: IGameState | null;
  deckArea?: React.ReactNode;
  centerArea: React.ReactNode;
  actionsArea?: React.ReactNode;
  trickPileOpponent?: React.ReactNode;
  trickPileOurs?: React.ReactNode;
  handArea: React.ReactNode;
  /** Ids de jogadores que devem pulsar (ex.: precisam responder ao truco). */
  highlightedPlayerIds?: string[];
  className?: string;
};

export { getTeamRelation, resolveTeamId };

function Seat({
  player,
  mainPlayer,
  game,
  highlighted,
}: {
  player: BasePlayer;
  mainPlayer: BasePlayer;
  game: IGameState;
  highlighted: boolean;
}) {
  const anchorRef = useAnchorRef(seatAnchor(player.userId));

  return (
    <div
      ref={anchorRef}
      className={styles.seat}>
      <Opponent
        player={player}
        isCurrentPlayerTurn={game.playerTurn === player.userId}
        team={getTeamRelation(game, player, mainPlayer)}
        highlighted={highlighted}
      />
    </div>
  );
}

function TableBoard({
  game,
  mainPlayer,
  orderedOpponents,
  deckArea,
  centerArea,
  actionsArea,
  trickPileOpponent,
  trickPileOurs,
  handArea,
  highlightedPlayerIds = [],
}: Omit<TableProps, "className" | "game"> & {
  game: IGameState;
  mainPlayer: BasePlayer;
  orderedOpponents: BasePlayer[];
}) {
  const seats = resolveTableSeats(game.players.length, orderedOpponents);
  const isMainPlayerTurn = game.playerTurn === mainPlayer.userId;

  const centerRef = useAnchorRef("center");
  const pileOpponentRef = useAnchorRef("pile:opponent");
  const pileOursRef = useAnchorRef("pile:ours");
  const deckRef = useAnchorRef("deck");
  const mainSeatRef = useAnchorRef(seatAnchor(mainPlayer.userId));

  const renderSeat = (slot: SeatSlot) => {
    const player = seats[slot];
    if (!player) return null;
    return (
      <Seat
        player={player}
        mainPlayer={mainPlayer}
        game={game}
        highlighted={highlightedPlayerIds.includes(player.userId)}
      />
    );
  };

  return (
    <GameBoard
      cellProps={{
        1: { ref: deckRef },
        3: { ref: pileOpponentRef },
        5: { ref: centerRef },
        9: { ref: pileOursRef },
      }}
      slot1={deckArea}
      slot2={renderSeat("slot2")}
      slot3={trickPileOpponent}
      slot4={renderSeat("slot4")}
      slot5={centerArea}
      slot6={renderSeat("slot6")}
      slot7={actionsArea}
      slot8={
        <div
          ref={mainSeatRef}
          className={classNames(styles.mainSeat, {
            [styles.isTurn]: isMainPlayerTurn,
          })}>
          <div className={styles.handArea}>{handArea}</div>
          <Opponent
            className={styles.playerChip}
            player={mainPlayer}
            isCurrentPlayerTurn={isMainPlayerTurn}
            team="ally"
            compact
            highlighted={highlightedPlayerIds.includes(mainPlayer.userId)}
          />
        </div>
      }
      slot9={trickPileOurs}
    />
  );
}

export default function Table({ game, className, ...areas }: TableProps) {
  const { mainPlayer, orderedOpponents } = useTablePlayers(game);
  const anchors = useSeatAnchors();

  if (!game || !mainPlayer) {
    return (
      <div
        className={styles.loadingTable}
        data-testid={testIds.game.tableLoading}>
        Aguardando o jogo...
      </div>
    );
  }

  const content = (
    <div
      className={classNames(styles.tableRoot, className)}
      data-testid={testIds.game.table}>
      <TableBoard
        game={game}
        mainPlayer={mainPlayer}
        orderedOpponents={orderedOpponents}
        {...areas}
      />
    </div>
  );

  // Quem precisa medir âncoras de fora da mesa (efeitos) pode prover acima.
  return anchors.isProvided ? (
    content
  ) : (
    <SeatAnchorProvider>{content}</SeatAnchorProvider>
  );
}
