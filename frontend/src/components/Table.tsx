import { useGameContext } from "@/contexts/game.context";
import styles from "@styles/Table.module.scss";

export default function Table() {
  const {
    rotatedPlayers
  } = useGameContext();

  const playerPositions = {
    1: ["bottom-center"],
    2: ["bottom-center", "top-center"],
    3: ["bottom-center", "top-left", "top-right"],
    4: ["bottom-left", "bottom-right", "top-left", "top-right"],
  }[rotatedPlayers.length] || ["bottom-center"];

  return (
    <div className={styles.table}>
      {rotatedPlayers.map((player, index) => (
        <div key={player.id} className={`${styles.player} ${styles[playerPositions[index]]}`}>
          <img src={player.image} alt={player.name} className={styles.avatar} />
          <p className={styles.name}>{player.name}</p>
        </div>
      ))}
    </div>
  );
}
