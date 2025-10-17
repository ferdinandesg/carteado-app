"use client"
import BackButton from "@//components/buttons/BackButton";
import { withSound } from "@//components/buttons/withSound";
import usePostRoom from "@//hooks/rooms/usePostRoom";
import { ArrowRightCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/CreateRoom.module.scss";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import UserCard from "@//components/UserCard";
import { useSession } from "next-auth/react";
import logger from "@//tests/utils/logger";

type RoomForm = {
    name: string;
    size: number;
    rule: "CarteadoGameRules" | "TrucoGameRules";
};

const players = {
    carteado: [2, 3, 4],
    truco: [2, 4],
};

const CreateRoomButton = withSound(
    ({ onClick, disabled, text }: { onClick: () => void; disabled: boolean, text: string }) => {
        return (
            <button
                type="button"
                data-testid="create-room-button"
                className={styles.createButton}
                onClick={onClick}
                disabled={disabled}>
                <span>{text}</span>
                <ArrowRightCircle size={24} />
            </button>
        );
    },
    {
        clickSrc: "/assets/sfx/button-click.mp3",
    }
);

export default function CreateRoom() {
    const { t } = useTranslation()
    const router = useRouter();
    const { data } = useSession();

    const [roomPayload, setRoomPayload] = useState<RoomForm>({
        name: "",
        size: 2,
        rule: "CarteadoGameRules",
    });
    const { createRoom } = usePostRoom();
    const isFormValid = roomPayload.name.length > 0;

    const handleUpdateRoomPayload =
        (key: keyof RoomForm) => (value: string | number) => {
            setRoomPayload((prev) => ({
                ...prev,
                [key]: value,
            }));
        };

    const handleCreateRoom = async () => {
        try {
            const {
                rule,
                size,
            } = roomPayload;
            if (rule === "TrucoGameRules" && size === 3) return
            const room = await createRoom(roomPayload);
            router.push(`/room/${room.hash}`);
        } catch (error) {
            logger.error(error);
        }
    };

    const roomSize = roomPayload.rule === "CarteadoGameRules" ? players.carteado : players.truco
    return <div className={classNames(styles.CreateRoom, "square-bg")}>
        <div className={styles.menuContent}>
            <UserCard user={data?.user} />
            <BackButton
                data-testid="back-button"
                color="dark"
                onClick={() => window.history.back()}
                size={24}
            />
            <input
                type="text"
                data-testid="room-name-input"
                id="username"
                placeholder={t("CreateRoom.roomName")}
                className={styles.input}
                onChange={(e) => handleUpdateRoomPayload("name")(e.target.value)}
            />
            <div className={styles.playersForm}>
                {roomSize.map((player) => (
                    <button
                        data-testid={`room-size-button-${player}`}
                        onClick={(e) =>
                            handleUpdateRoomPayload("size")(+e.currentTarget.value)
                        }
                        value={player}
                        key={`room-size-${player}`}
                        className={classNames(
                            roomPayload.size === player && styles.selected
                        )}>
                        {player}
                    </button>
                ))}
            </div>
            <div className={styles.playersForm}>
                <button
                    data-testid="room-rule-button-CarteadoGameRules"
                    onClick={(e) =>
                        handleUpdateRoomPayload("rule")(e.currentTarget.value)
                    }
                    value="CarteadoGameRules"
                    key={`room-rule-CarteadoGameRules`}
                    className={classNames(
                        roomPayload.rule === "CarteadoGameRules" && styles.selected
                    )}>
                    Carteado
                </button>
                <button
                    data-testid="room-rule-button-TrucoGameRules"
                    onClick={(e) =>
                        handleUpdateRoomPayload("rule")(e.currentTarget.value)
                    }
                    value="TrucoGameRules"
                    key={`room-rule-TrucoGameRules`}
                    className={classNames(
                        roomPayload.rule === "TrucoGameRules" && styles.selected
                    )}>
                    Truco
                </button>
            </div>

            <CreateRoomButton
                text={t("CreateRoom.create")}
                onClick={handleCreateRoom}
                disabled={!isFormValid} />
        </div>
    </div>
}