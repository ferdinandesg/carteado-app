import { useRoomContext } from "@/contexts/room.context";
import styles from "@/styles/Game.module.scss";
import { testIds } from "@/tests/testIds";
import { GameRuleNames } from "shared/game";

import { gameComponents } from "./game.registry";

export default function Game() {
  const { room, isLoading } = useRoomContext();
  if (isLoading || !room) return;

  const GameComponent = gameComponents[room.rule as GameRuleNames];
  if (!GameComponent) return null;

  return (
    <div
      className={styles.gameRoot}
      data-testid={testIds.game.root}>
      <GameComponent />
    </div>
  );
}
