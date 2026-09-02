import { GameRuleNames, GameStatus } from "shared/game";

import { useGameStore } from "@/contexts/game.store";
import { useRoomContext } from "@/contexts/room.context";
import ModalGameFinished from "@/components/Modal/ModalGameFinished/ModalGameFinished";
import styles from "@/styles/Game.module.scss";
import { testIds } from "@/tests/testIds";

import { gameComponents } from "./game.registry";

export default function Game() {
  const { room, isLoading } = useRoomContext();
  const gameStatus = useGameStore((state) => state.game?.status);
  if (isLoading || !room) return;

  const GameComponent = gameComponents[room.rule as GameRuleNames];
  if (!GameComponent) return null;

  return (
    <div
      className={styles.gameRoot}
      data-testid={testIds.game.root}>
      <GameComponent />
      <ModalGameFinished isOpen={gameStatus === GameStatus.FINISHED} />
    </div>
  );
}
