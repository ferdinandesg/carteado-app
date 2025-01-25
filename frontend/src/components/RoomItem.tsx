import { RoomInterface } from "@/hooks/rooms/useFetchRooms";
import classNames from "classnames";

import styles from "@styles/Rooms.module.scss";
import Image from "next/image";
import { Circle, Loader } from "lucide-react";

type RoomItemProps = {
  room: RoomInterface;
  onClick?: (room: RoomInterface) => void;
};

const RoomStatus = ({ status }: { status: "open" | "playing" }) => {
  let icon = null;
  if (status === "open") {
    icon = (
      <Circle
        className={styles.icon}
        size={24}
      />
    );
  }
  if (status === "playing") {
    icon = (
      <Loader
        className={styles.icon}
        size={24}
      />
    );
  }
  return (
    <span className={classNames(styles.roomStatus, styles[status])}>
      {icon}
      <span className={styles.label}>{status}</span>
    </span>
  );
};

const RoomItem = ({ room, onClick = () => {} }: RoomItemProps) => {
  const ownerPic = room.owner?.image || "/images/default-avatar.png";
  return (
    <div
      onClick={() => onClick(room)}
      className={styles.RoomItem}
      key={room.id}>
      <Image
        className={styles.owner}
        alt={ownerPic}
        src={ownerPic}
        width={100}
        height={100}
      />
      <div className={styles.roomInfo}>
        <span className={styles.roomHash}>#{room.hash.toUpperCase()}</span>
        <span className={styles.roomName}>{room.name}</span>
      </div>
      <div className={styles.roomData}>
        <RoomStatus status={room.status} />
        <div className={styles.infoCount}>
          <span className={styles.label}>Jogadores</span>
          <span className={styles.count}>
            {room.players.length}/{room.size}
          </span>
        </div>
        <div className={styles.infoCount}>
          <span className={styles.label}>Rank</span>
          <span className={styles.count}>{room.owner?.rank}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomItem;
