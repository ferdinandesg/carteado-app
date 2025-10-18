"use client"
import styles from "@/styles/ModalGameFinished.module.scss";
import { useTranslation } from "react-i18next";
import BackButton from "@//components/buttons/BackButton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectCurrentPlayer, useGameStore } from "@//contexts/game.store";
import { useTypedGame } from "@/hooks/useTrucoGame";
import { isTrucoGame } from "shared/game";

interface ModalGameFinishedProps {
    isOpen: boolean;
}

export default function ModalGameFinished({ isOpen }: ModalGameFinishedProps) {
    const { t } = useTranslation()
    const game = useTypedGame(isTrucoGame);
    const player = useGameStore(selectCurrentPlayer);

    const router = useRouter();

    useEffect(() => {
        if (!isOpen) return
        const audio = new Audio("/assets/sfx/game-finished.mp3");
        audio.volume = 0.15;
        audio.playbackRate = 1.75;
        audio.play();
    }, [])
    if (!isOpen) return null;

    const handleBack = () => {
        router.push("/menu");
    }

    const winner = game?.teams?.length ? game?.teams?.find(t => t.score >= 12)?.id : player?.name;

    return (
        <div className={styles.Overlay}>
            <div className={styles.ModalGameFinished}>
                <div className={styles.gameWinnerInfo}>
                    <h1 className={styles.info}>{t("Game.gameFinished")}</h1>
                    <h2 className={styles.winner}>
                        {t("Game.winner", {
                            winner
                        })}</h2>
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
