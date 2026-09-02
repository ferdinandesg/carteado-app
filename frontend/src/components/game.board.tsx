import classNames from "classnames";
import React from "react";

import styles from "@/styles/GameBoard.module.scss";

export type BoardSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type SlotProps = Partial<Record<`slot${BoardSlot}`, React.ReactNode>>;

type GameBoardProps = SlotProps & {
  className?: string;
  /** Props extras por célula (ex.: refs de âncora, data-testid). */
  cellProps?: Partial<Record<BoardSlot, React.ComponentPropsWithRef<"div">>>;
};

const SLOTS: BoardSlot[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function GameBoard({
  className,
  cellProps,
  ...slots
}: GameBoardProps) {
  return (
    <div className={classNames(styles.gameBoard, className)}>
      {SLOTS.map((slot) => {
        const extra = cellProps?.[slot];
        return (
          <div
            key={slot}
            {...extra}
            data-slot={slot}
            className={classNames(
              styles.gridCell,
              styles[`slot${slot}`],
              { [styles.centerCell]: slot === 5 },
              extra?.className
            )}>
            {slots[`slot${slot}`]}
          </div>
        );
      })}
    </div>
  );
}
