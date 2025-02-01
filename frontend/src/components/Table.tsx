import { useGameContext } from "@/contexts/game.context";
import CardBunch from "./CardBunch";
import Opponent from "./Opponent/Opponent";
import styles from "@styles/Table.module.scss";
import { useRef } from "react";
import classNames from "classnames";
import { Player } from "shared/types";
import TableActions from "./TableActions";

const PositionedPlayer = ({
  player,
  centerX,
  centerY,
  angleOffset,
  radius,
  numPlayers,
  i,
}: {
  player: Player;
  centerX: number;
  centerY: number;
  angleOffset: number;
  radius: number;
  numPlayers: number;
  i: number;
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
      <Opponent player={player} />
    </div>
  );
};

export default function Table() {
  const { cards } = useGameContext();
  const tableRef = useRef<HTMLDivElement>(null);
  const { rotatedPlayers, bunchCards, retrieveCard } = useGameContext();

  const tableWidth = tableRef.current?.clientWidth || 0;
  const tableHeight = tableRef.current?.clientHeight || 0;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const angleOffset = Math.PI / 2;

  const radius = (tableHeight / 2) - 50;

  return (
    <div
      ref={tableRef}
      className={styles.Table}>
      {rotatedPlayers.map((player, i) => (
        <PositionedPlayer
          player={player}
          numPlayers={rotatedPlayers.length}
          key={player.userId}
          centerX={centerX}
          centerY={centerY}
          angleOffset={angleOffset}
          radius={radius}
          i={i}
        />
      ))}
      <CardBunch
        tableHeight={tableWidth}
        cards={bunchCards}
        onClick={retrieveCard}
      />
      <div className={styles.remaining}>
        {cards.length}
      </div>
      <TableActions />
    </div>
  );
}
