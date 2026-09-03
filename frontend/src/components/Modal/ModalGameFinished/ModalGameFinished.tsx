"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { isTrucoGame, TRUCO_WINNING_SCORE } from "shared/game";

import Modal from "@/components/Modal";
import ActionButton from "@/components/buttons/ActionButton";
import { selectCurrentPlayer, useGameStore } from "@/contexts/game.store";
import { useTypedGame } from "@/hooks/useTypedGame";
import { testIds } from "@/tests/testIds";

import styles from "@/styles/ModalGameFinished.module.scss";

interface ModalGameFinishedProps {
  isOpen: boolean;
}

export default function ModalGameFinished({ isOpen }: ModalGameFinishedProps) {
  const { t } = useTranslation();
  const game = useTypedGame(isTrucoGame);
  const player = useGameStore(selectCurrentPlayer);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const audio = new Audio("/assets/sfx/game-finished.mp3");
    audio.volume = 0.15;
    audio.playbackRate = 1.75;
    try {
      void audio.play()?.catch(() => undefined);
    } catch {
      // jsdom / browsers sem autoplay
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const winningTeam = game?.teams.find(
    (team) => team.score >= TRUCO_WINNING_SCORE
  );
  const winner =
    winningTeam && game
      ? game.players
          .filter((entry) => winningTeam.userIds.includes(entry.userId))
          .map((entry) => entry.name)
          .filter(Boolean)
          .join(" & ") || winningTeam.id
      : player?.name;

  return (
    <Modal.Root
      className={styles.panel}
      data-testid={testIds.game.finishedModal}>
      <Modal.Content className={styles.content}>
        <p className={styles.eyebrow}>{t("Game.gameFinished")}</p>
        <h2 className={styles.winner}>{t("Game.winner", { winner })}</h2>
      </Modal.Content>
      <Modal.Footer className={styles.footer}>
        <ActionButton
          type="button"
          variant="primary"
          onClick={() => router.push("/menu")}>
          {t("Game.backToMenu")}
        </ActionButton>
      </Modal.Footer>
    </Modal.Root>
  );
}
