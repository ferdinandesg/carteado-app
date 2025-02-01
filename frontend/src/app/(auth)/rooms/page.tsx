"use client";
import SearchComponent from "@/components/Search";
import { useRouter } from "next/navigation";
import useFetchRooms, { RoomInterface } from "@/hooks/rooms/useFetchRooms";
import RoomItem from "@/components/RoomItem";

import styles from "@styles/Rooms.module.scss";
import classNames from "classnames";
import BackButton from "@/components/buttons/BackButton";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";

type RoomListType = {
  rooms: RoomInterface[];
  onClick: (room: RoomInterface) => void;
};

const RoomList = ({ rooms, onClick }: RoomListType) => {
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
  const { t } = useTranslation()
  useTitle({ title: t("pageTitles.rooms") });

  const router = useRouter();
  const { data, isLoading } = useFetchRooms();

  const goToRoom = (hash: string) => {
    try {
      router.push(`/room/${hash}`);
    } catch (error) {
      console.error(error);
    }
  };

  const goToMenu = () => {
    try {
      router.push("/menu");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={classNames(styles.Rooms)}>
      <BackButton
        onClick={goToMenu}
        size={24}
      />
      <SearchComponent />
      <div className={styles.RoomList}>
        {isLoading && <span>{t("loading")}</span>}
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
