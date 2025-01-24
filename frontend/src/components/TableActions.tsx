import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/Game.module.scss";

export default function TableActions() {
  const { game, endTurn, drawTable } = useGameContext();
  const isGameStarted = game?.status === "playing";
  if (!isGameStarted) return;
  return (
    <div className={styles.actions}>
      <button onClick={drawTable}>Buy table cards</button>
      <button onClick={endTurn}>End Turn</button>
    </div>
  );
}
