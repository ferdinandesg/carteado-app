import React from "react";
import styles from "@/styles/GameBoard.module.scss";

type GameBoardProps = {
  slot1?: React.ReactNode;
  slot2?: React.ReactNode;
  slot3?: React.ReactNode;
  slot4?: React.ReactNode;
  slot5?: React.ReactNode;
  slot6?: React.ReactNode;
  slot7?: React.ReactNode;
  slot8?: React.ReactNode;
  slot9?: React.ReactNode;
};

const GameBoard: React.FC<GameBoardProps> = ({
  slot1,
  slot2,
  slot3,
  slot4,
  slot5,
  slot6,
  slot7,
  slot8,
  slot9,
}) => {
  return (
    <div className={styles.gameBoard}>
      <div className={styles.gridCell}>{slot1}</div>
      <div className={styles.gridCell}>{slot2}</div>
      <div className={styles.gridCell}>{slot3}</div>
      <div className={styles.gridCell}>{slot4}</div>
      <div className={styles.gridCell}>{slot5}</div>
      <div className={styles.gridCell}>{slot6}</div>
      <div className={styles.gridCell}>{slot7}</div>
      <div className={styles.gridCell}>{slot8}</div>
      <div className={styles.gridCell}>{slot9}</div>
    </div>
  );
};

export default GameBoard;