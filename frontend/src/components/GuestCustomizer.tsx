"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Play } from "lucide-react";
import styles from "@//styles/GuestCustomizer.module.scss";
import Image from "next/image";
import classNames from "classnames";
import BackButton from "./buttons/BackButton";
import { useTranslation } from "react-i18next";
import { Pixelify_Sans } from "next/font/google";

const avatarOptions = [
    "/assets/avatars/avatar3.png",
    "/assets/avatars/avatar4.png",
    "/assets/avatars/avatar5.png",
    "/assets/avatars/avatar6.png",
];

const skinOptions = [
    { name: "8-bit Blue", value: "8bit", path: "/assets/skins/8bit/clubs/2clubs.png" },
    { name: "Basics", value: "basics/white", path: "/assets/skins/basics/white/clubs/2clubs.png" },
    { name: "Basics", value: "basics/black", path: "/assets/skins/basics/black/clubs/2clubs.png" },
    { name: "Poker", value: "poker", path: "/assets/skins/poker/clubs/2clubs.png" },
];

interface GuestCustomizerProps {
    onBack: () => void;
}
const pixelify = Pixelify_Sans({
    weight: ["400"],
    subsets: ["latin"],
});
export default function GuestCustomizer({ onBack }: GuestCustomizerProps) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState(avatarOptions[0]);
    const [skin, setSkin] = useState(skinOptions[0].value);

    const handleGuestLogin = () => {
        if (!name.trim()) return;

        signIn("credentials", {
            username: name,
            avatar: avatar,
            skin: skin,
            callbackUrl: "/menu",
        });
    };

    return (

        <div className={classNames(styles.customizerContainer, "square-bg", pixelify.className)}>
            <div className={styles.customizerBox}>
                <BackButton
                    data-testid="back-button"
                    color="light"
                    onClick={onBack}
                    size={24}
                />
                <h2 className={styles.title}>Personalize o seu Perfil</h2>


                <input
                    type="text"
                    data-testid="guest-name-input"
                    id="guestname"
                    placeholder={t("Home.guestNickname")}
                    className={styles.input}
                    onChange={e => setName(e.target.value)}
                />

                <div className={styles.formGroup}>
                    <label>{t("Home.ChooseAvatar")}</label>
                    <div className={styles.optionsGrid}>
                        {avatarOptions.map((src) => (
                            <Image
                                key={src}
                                src={src}
                                alt="Avatar"
                                width={120}
                                height={120}
                                className={`${styles.optionItem} ${avatar === src ? styles.selected : ""}`}
                                onClick={() => setAvatar(src)}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Escolha uma skin para as cartas</label>
                    <div className={styles.optionsGrid}>
                        {skinOptions.map((s) => (
                            <Image
                                key={s.path}
                                src={s.path}
                                alt={s.name}
                                width={100}
                                height={100}
                                className={`${styles.optionItem} ${skin === s.value ? styles.selected : ""}`}
                                onClick={() => setSkin(s.value)}
                            />
                        ))}
                    </div>
                </div>

                <button
                    className={styles.createButton}
                    onClick={handleGuestLogin}
                    disabled={!name.trim()}
                >
                    Jogar <Play size={20} />
                </button>
            </div>
        </div>
    );
}