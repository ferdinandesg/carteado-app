import { RoomInterface } from "@/models/room";
import styles from "@/styles/RoomInfo.module.scss";
import { useTranslation } from "react-i18next";
import Chat from "@/components/Chat";

export default function RoomInfo({ room }: { room: RoomInterface }) {
  const { t } = useTranslation();
  const ownerName = room.owner?.name ?? room.ownerId ?? "-";

  return (
    <aside className={styles.roomInfo}>
      <div className={styles.content}>
        <h2 className={styles.roomTitle}>{t("RoomInfo.title")}</h2>
        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>{t("RoomItem.status")}</dt>
            <dd>{t(`RoomItem.${room.status}`)}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>{t("RoomInfo.participants")}</dt>
            <dd>
              {room.participants.length}/{room.size}
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt>{t("RoomInfo.hash")}</dt>
            <dd>{room.hash}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>{t("RoomItem.rule")}</dt>
            <dd>{t(`RoomItem.${room.rule}`)}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>{t("RoomInfo.owner")}</dt>
            <dd>{ownerName}</dd>
          </div>
        </dl>
      </div>

      <Chat
        toggleCollapse={() => {}}
        roomHash={room.hash}
        isCollapsed={false}
      />
    </aside>
  );
}
