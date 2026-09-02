"use client";
import styles from "@/styles/ModalGameFinished.module.scss";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/buttons/BackButton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectCurrentPlayer, useGameStore } from "@/contexts/game.store";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isTrucoGame } from "shared/game";
import { testIds } from "@/tests/testIds";

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

  const handleBack = () => {
    router.push("/menu");
  };

  const winningTeam = game?.teams?.find((team) => team.score >= 12);
  const winner = winningTeam
    ? game.players
        .filter((entry) => winningTeam.userIds.includes(entry.userId))
        .map((entry) => entry.name)
        .filter(Boolean)
        .join(" & ") || winningTeam.id
    : player?.name;

  return (
    <div
      className={styles.Overlay}
      data-testid={testIds.game.finishedModal}>
      <div className={styles.ModalGameFinished}>
        <div className={styles.gameWinnerInfo}>
          <h1 className={styles.info}>{t("Game.gameFinished")}</h1>
          <h2 className={styles.winner}>
            {t("Game.winner", {
              winner,
            })}
          </h2>
        </div>
        <BackButton
          size={48}
          onClick={handleBack}
          color="light"
        />
      </div>
    </div>
  );
}
