import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Play, UserCheck } from "lucide-react";

import ActionButton from "@/components/buttons/ActionButton";
import { useLobbyActions } from "@/hooks/rooms/useLobbyActions";
import styles from "@/styles/Lobby.module.scss";
import { testIds } from "@/tests/testIds";

export default function Lobby() {
  const { t } = useTranslation();
  const { isReady, isOwner, toggleReady, startGame } = useLobbyActions();

  return (
    <div className={classNames(styles.LobbyContainer)}>
      <span className={classNames("animate-bounce", styles.waiting)}>
        {t("Lobby.waitingPlayers")}
      </span>
      <ActionButton
        type="button"
        variant={isReady ? "secondary" : "primary"}
        size="lg"
        icon={<UserCheck size={24} />}
        data-testid={testIds.lobby.ready}
        className={classNames(
          styles.statusButton,
          isReady ? styles.ready : styles.notReady
        )}
        onClick={toggleReady}>
        {t("Lobby.imReady")}
      </ActionButton>
      {isOwner && (
        <ActionButton
          type="button"
          variant="accent"
          size="lg"
          icon={<Play size={24} />}
          data-testid={testIds.lobby.startGame}
          className={styles.startGame}
          onClick={startGame}>
          {t("Lobby.startGame")}
        </ActionButton>
      )}
    </div>
  );
}
