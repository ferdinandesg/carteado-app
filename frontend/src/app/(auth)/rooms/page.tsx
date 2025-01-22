"use client";
import SearchComponent from "@/components/Search";
import { useRouter } from "next/navigation";
import useFetchRooms, { RoomInterface } from "@/hooks/rooms/useFetchRooms";
import RoomItem from "@/components/RoomItem";

import styles from "@styles/Rooms.module.scss";

type RoomList = {
  rooms: RoomInterface[];
  onClick: (room: RoomInterface) => void;
};

const RoomList = ({ rooms, onClick }: RoomList) => {
  return (
    <div className={styles.RoomList}>
      {rooms.map((room) => (
        <RoomItem
          key={`room-${room.hash}`}
          room={room}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

export default function Rooms() {
  const router = useRouter();
  const { data, isLoading } = useFetchRooms();

  const goToRoom = (hash: string) => {
    try {
      router.push(`/room/${hash}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.Rooms}>
      <SearchComponent />
      <div className={styles.RoomList}>
        {isLoading && <span>Loading...</span>}
        {!isLoading && data?.length && (
          <RoomList
            onClick={(r) => goToRoom(r.hash)}
            rooms={data}
          />
        )}
      </div>
    </div>
  );
}
