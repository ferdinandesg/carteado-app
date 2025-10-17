import useRoomByHash from "@//hooks/rooms/useRoomByHash";
import styles from "@/styles/Chat.module.scss";

export default function Header({
  roomHash,
  messageCount,
}: {
  roomHash: string;
  messageCount: number;
}) {
  const { room } = useRoomByHash(roomHash);

  return (
    <div className={styles.header}>
      <span>
        Bate-papo salas <span id="chat-room-name">{room?.name}</span> (
        {messageCount})
      </span>
    </div>
  );
}
