"use client"
import styles from "@styles/ModalJoinAsGuest.module.scss";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";

interface ModalJoinAsGuestProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalJoinAsGuest({ isOpen, onClose }: ModalJoinAsGuestProps) {
    const { t } = useTranslation()
    const [username, setUsername] = useState<string>("");

    const joinAsGuest = async () => {
        try {
            const result = await signIn("credentials", { username });

        } catch (error) {
            toast(t(`ServerMessages.errors.GUEST_CREATION`), { type: "error" });
        }
    }
    if (!isOpen) return null;

    const handleBack = () => {
        onClose()
    }

    return (
        <div className={styles.Overlay}>
            <div className={styles.ModalJoinAsGuest}>
                <h1 className={styles.title}>{t("Home.joinAsGuest")}</h1>
                <div className={styles.inputForm}>
                    <input
                        type="text"
                        id="guestNickname"
                        placeholder={t("Home.guestNickname")}
                        className={styles.input}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className={styles.actions}>
                    <button onClick={handleBack} className={styles.backButton}>
                        Voltar
                    </button>
                    <button onClick={joinAsGuest} className={styles.confirmButton}>
                        Entrar
                    </button>
                </div>
            </div>
        </div>
    );
}
