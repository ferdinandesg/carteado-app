import { RoomsInterface } from "@//hooks/rooms/useRoomByHash";
import styles from "@/styles/RoomInfo.module.scss";
import { PanelLeftClose, PanelRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RoomInfo({ room, isCollapsed, toggleCollapse }: { room: RoomsInterface, isCollapsed?: boolean, toggleCollapse?: () => void }) {
    const { t } = useTranslation();
    return (
        <div className={styles.roomInfo}>
            <div className={styles.header} onClick={toggleCollapse}>
                {!isCollapsed ? <PanelRight /> : <PanelLeftClose />}
            </div>
            {!isCollapsed && <div >

                <h2 className={styles.roomTitle}>{t("RoomInfo.title")}</h2>
                <p className={styles.roomStatus}>{t("RoomInfo.status", { status: t(room.status) })}</p>
                <p className={styles.roomParticipants}>
                    {t("RoomInfo.participants")} ({room.participants.length}/{room.size})
                </p>
                <p className={styles.roomHash}>
                    {t("RoomInfo.hash")}: <span> {room.hash}</span>
                </p>
                <p className={styles.roomModality}>
                    {room.rule === "TrucoGameRules" ? "Truco" : "Carteado"}
                </p>
            </div>}
        </div>
    );
}