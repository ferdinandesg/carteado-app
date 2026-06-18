import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import styles from "@/styles/Chat.module.scss";
import { useTranslation } from "react-i18next";

export default function Header({
  roomHash,
  messageCount,
}: {
  roomHash: string;
  messageCount: number;
}) {
  const { t } = useTranslation();
  const { room } = useRoomByHash(roomHash);

  return (
    <div className={styles.header}>
      <span>
        {t("Chat.roomMessages", {
          roomName: room?.name,
          count: messageCount,
        })}
      </span>
    </div>
  );
}
