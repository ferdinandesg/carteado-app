import React from "react";
import classNames from "classnames";
import Opponent from "@/components/Opponent/Opponent";
import { resolveTableSeats } from "@/lib/game/tableLayout";
import { useTablePlayers } from "@/hooks/game/useTablePlayers";
import styles from "@/styles/Table.module.scss";
import { BasePlayer, IGameState } from "shared/game";
import { testIds } from "@/tests/testIds";

import GameBoard from "./game.board";

type TableProps = {
  game: IGameState | null;
  deckArea: React.ReactNode;
  playedCardsArea: React.ReactNode;
  actionsAreaLeft?: React.ReactNode;
  actionsAreaRight?: React.ReactNode;
};

function TableOpponent({
  player,
  playerTurn,
}: {
  player: BasePlayer;
  playerTurn: string;
}) {
  return (
    <Opponent
      player={player}
      isCurrentPlayerTurn={playerTurn === player.userId}
    />
  );
}

export default function Table({
  game,
  deckArea,
  playedCardsArea,
  actionsAreaLeft,
  actionsAreaRight,
}: TableProps) {
  const { mainPlayer, orderedOpponents } = useTablePlayers(game);

  if (!game || !mainPlayer) {
    return (
      <div
        className={styles.loadingTable}
        data-testid={testIds.game.tableLoading}>
        Aguardando o jogo...
      </div>
    );
  }

  const seats = resolveTableSeats(game.players.length, orderedOpponents);
  const isMainPlayerTurn = game.playerTurn === mainPlayer.userId;

  return (
    <div
      className={styles.tableRoot}
      data-testid={testIds.game.table}>
      <GameBoard
        slot1={deckArea}
        slot2={
          seats.top && (
            <TableOpponent
              player={seats.top}
              playerTurn={game.playerTurn}
            />
          )
        }
        slot4={
          seats.left && (
            <TableOpponent
              player={seats.left}
              playerTurn={game.playerTurn}
            />
          )
        }
        slot5={playedCardsArea}
        slot6={
          seats.right && (
            <TableOpponent
              player={seats.right}
              playerTurn={game.playerTurn}
            />
          )
        }
        slot7={actionsAreaLeft}
        slot8={
          <div
            className={classNames(styles.playerSeat, {
              [styles.isTurn]: isMainPlayerTurn,
            })}>
            <TableOpponent
              player={mainPlayer}
              playerTurn={game.playerTurn}
            />
          </div>
        }
        slot9={actionsAreaRight}
      />
    </div>
  );
}
