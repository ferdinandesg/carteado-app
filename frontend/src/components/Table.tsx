import React from "react";
import { useSession } from "next-auth/react";
import { useGameStore } from "@//contexts/game.store";
import Opponent from "@//components/Opponent/Opponent";
import styles from "@//styles/Table.module.scss"; // Estilos específicos da mesa
import GameBoard from "./game.board";
import { BasePlayer, IGameState } from "shared/game";

type TableProps = {
  // Props para injetar conteúdo agnóstico
  game: IGameState | null;
  deckArea: React.ReactNode;
  playedCardsArea: React.ReactNode;
  actionsAreaLeft?: React.ReactNode;
  actionsAreaRight?: React.ReactNode;
};

const Table: React.FC<TableProps> = ({
  game,
  deckArea,
  playedCardsArea,
  actionsAreaLeft,
  actionsAreaRight,
}) => {
  const { data: session } = useSession();


  const { mainPlayer, orderedOpponents } = React.useMemo(() => {
    if (!game || !session?.user) return { mainPlayer: null, orderedOpponents: [] };
    const player = game.players.find((p) => p.userId === session.user.id);
    const mainPlayerIndex = game.players.findIndex(p => p.userId === session.user.id);
    const opponents: BasePlayer[] = [];
    if (mainPlayerIndex !== -1) {
      for (let i = 1; i < game.players.length; i++) {
        const opponentIndex = (mainPlayerIndex + i) % game.players.length;
        opponents.push(game.players[opponentIndex]);
      }
    }
    return { mainPlayer: player, orderedOpponents: opponents };
  }, [game, session]);

  if (!game || !mainPlayer) {
    return <div className={styles.loadingTable}>Aguardando o jogo...</div>;
  }

  const topOpponent = game.players.length === 2 ? orderedOpponents[0] : orderedOpponents[1];
  const leftOpponent = game.players.length > 2 ? orderedOpponents[0] : null;
  const rightOpponent = game.players.length > 2 ? orderedOpponents[2] : null;
  return (
    <GameBoard
      // Preenche os slots do GameBoard com os componentes
      slot1={deckArea}
      slot2={topOpponent && <Opponent player={topOpponent} isCurrentPlayerTurn={game.playerTurn === topOpponent.userId} />}
      slot4={leftOpponent && <Opponent player={leftOpponent} isCurrentPlayerTurn={game.playerTurn === leftOpponent.userId} />}
      slot5={playedCardsArea}
      slot6={rightOpponent && <Opponent player={rightOpponent} isCurrentPlayerTurn={game.playerTurn === rightOpponent.userId} />}
      slot7={actionsAreaLeft}
      slot8={
        <div className={`${styles.playerName} ${game.playerTurn === mainPlayer.userId ? styles.isTurn : ''}`}>
          <Opponent player={mainPlayer} isCurrentPlayerTurn={game.playerTurn === mainPlayer.userId} />
        </div>
      }
      slot9={actionsAreaRight}
    />
  );
};

export default Table;