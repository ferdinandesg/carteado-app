"use client"
import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/ModalGameFinished.module.scss";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/buttons/BackButton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ModalGameFinishedProps {
    isOpen: boolean;
}

export default function ModalGameFinished({ isOpen }: ModalGameFinishedProps) {
    const { t } = useTranslation()
    const router = useRouter();
    const { player } = useGameContext();


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

    return (
        <div className={styles.Overlay}>
            <div className={styles.ModalGameFinished}>
                <div className={styles.gameWinnerInfo}>
                    <h1 className={styles.info}>{t("Game.gameFinished")}</h1>
                    <h2 className={styles.winner}>
                        {t("Game.winner", {
                            winner: player?.name
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
