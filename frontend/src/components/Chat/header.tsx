import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import styles from "@styles/Chat.module.scss";

export default function Header({ roomId, messageCount }: { roomId: string, messageCount: number }) {
  const { room } = useRoomByHash(roomId);

  return <div className={styles.header}>
    <span>
      Bate-papo sala <span id="chat-room-name">
        {room?.name}
      </span> ({messageCount})
    </span>
  </div>
}