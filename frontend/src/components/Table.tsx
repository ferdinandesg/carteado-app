import CardBunch from "./CardBunch";
import styles from "@styles/Table.module.scss";
import { useRef } from "react";
import classNames from "classnames";
import { Player } from "shared/types";
import CardComponent from "./Card";
import Shaky from "./Shaky";
import { selectPlayers, useGameStore } from "@/contexts/game.store";

const PositionedPlayer = ({
  player,
  centerX,
  centerY,
  angleOffset,
  radius,
  numPlayers,
  i,
  OpponentComponent
}: {
  player: Player;
  centerX: number;
  centerY: number;
  angleOffset: number;
  radius: number;
  numPlayers: number;
  i: number;
  OpponentComponent: React.ComponentType<{ player: Player }>;
}) => {
  const angle = angleOffset - (2 * Math.PI * i) / numPlayers;
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  const playerStyle = {
    left: `${x}px`,
    top: `${y}px`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div
      key={player.userId}
      className={classNames(styles.player)}
      style={playerStyle}>
      <OpponentComponent player={player} />
    </div>
  );
};

type TableProps = {
  tableActions: React.ReactNode;
  OpponentComponent: React.ComponentType<{ player: Player }>;
}

export default function Table({ tableActions, OpponentComponent }: TableProps) {
  const { game, undoPlay } = useGameStore();
  const players = useGameStore(selectPlayers);

  const isTruco = game?.rulesName === "TrucoGameRules"
  const vira = game?.vira
  const tableRef = useRef<HTMLDivElement>(null);

  const tableWidth = tableRef.current?.clientWidth || 0;
  const tableHeight = tableRef.current?.clientHeight || 0;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const angleOffset = Math.PI / 2;

  const radius = (tableHeight / 2) - 50;
  const cardHeight = tableHeight > 300
    ? tableHeight / 3
    : tableHeight / 2;
  return (
    <div
      ref={tableRef}
      className={styles.Table}>
      {players.map((player, i) => (
        <PositionedPlayer
          player={player}
          numPlayers={players.length}
          key={player.userId}
          centerX={centerX}
          centerY={centerY}
          angleOffset={angleOffset}
          radius={radius}
          i={i}
          OpponentComponent={OpponentComponent}
        />
      ))}
      <div className={styles.vira}>
        {vira &&
          <Shaky value={vira.rank}>
            <CardComponent height={cardHeight / 1.25} card={vira} />
          </Shaky>
        }
      </div>
      <CardBunch
        cardHeight={cardHeight}
        cards={game?.bunch || []}
        onClick={undoPlay}
      />
      {!isTruco && <div className={styles.remaining}>
        {game?.bunch.length}
      </div>}
      {tableActions}
    </div>
  );
}
