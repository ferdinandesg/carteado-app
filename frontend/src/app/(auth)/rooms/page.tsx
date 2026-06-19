"use client";
import SearchComponent from "@/components/Search";
import { useRouter } from "next/navigation";
import useFetchRooms from "@/hooks/rooms/useFetchRooms";
import { RoomInterface } from "@/models/room";
import RoomItem from "@/components/RoomItem";
import MenuShell from "@/components/menu/MenuShell";

import styles from "@/styles/Rooms.module.scss";
import BackButton from "@/components/buttons/BackButton";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";
import logger from "@/lib/logger";
import { useMemo, useState } from "react";
import ActionButton from "@/components/buttons/ActionButton";
import { ListPlus, Play } from "lucide-react";

type RoomListType = {
  rooms: RoomInterface[];
  onClick: (room: RoomInterface) => void;
  selectedRoomHash: string | null;
};

const RoomList = ({ rooms, selectedRoomHash, onClick }: RoomListType) => {
  return (
    <ul
      data-testid="room-list"
      className={styles.RoomList}>
      {rooms.map((room) => (
        <li key={`room-${room.hash}`}>
          <RoomItem
            room={room}
            isSelected={selectedRoomHash === room.hash}
            onClick={onClick}
          />
        </li>
      ))}
    </ul>
  );
};

export default function Rooms() {
  const { t } = useTranslation();
  useTitle({ title: t("pageTitles.rooms") });

  const router = useRouter();
  const { data, isLoading } = useFetchRooms();
  const [search, setSearch] = useState("");
  const [selectedRoomHash, setSelectedRoomHash] = useState<string | null>(null);

  const rooms = useMemo<RoomInterface[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return data;

    return data.filter((room: RoomInterface) => {
      const roomRule = t(`RoomItem.${room.rule}`).toLowerCase();

      return [room.name, room.hash, roomRule].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [data, search, t]);

  const selectedRoom = rooms.find((room) => room.hash === selectedRoomHash);

  const goToRoom = (hash: string) => {
    try {
      router.push(`/room/${hash}`);
    } catch (error) {
      logger.error(error);
    }
  };

  const goToMenu = () => {
    try {
      router.push("/menu");
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <MenuShell
      activeTabLabel={t("Menu.createdRooms")}
      contentSize="wide">
      <div className={styles.roomsCardContent}>
        <header className={styles.roomsToolbar}>
          <BackButton
            data-testid="back-button"
            onClick={goToMenu}
            size={24}
            color="white"
          />
          <SearchComponent
            value={search}
            onChange={setSearch}
            placeholder={t("Menu.searchRooms")}
          />
        </header>

        <div className={styles.roomsListFrame}>
          {isLoading && <span className={styles.feedback}>{t("loading")}</span>}
          {!isLoading && rooms.length === 0 && (
            <span className={styles.feedback}>{t("Room.noRooms")}</span>
          )}
          {!isLoading && rooms.length > 0 && (
            <RoomList
              onClick={(room) => setSelectedRoomHash(room.hash)}
              rooms={rooms}
              selectedRoomHash={selectedRoomHash}
            />
          )}
        </div>

        <div className={styles.roomsActions}>
          <ActionButton
            type="button"
            variant="primary"
            size="lg"
            icon={<Play size={28} />}
            disabled={!selectedRoom}
            onClick={() => selectedRoom && goToRoom(selectedRoom.hash)}
            fullWidth>
            {t("Menu.play")}
          </ActionButton>

          <ActionButton
            type="button"
            variant="accent"
            size="lg"
            icon={<ListPlus size={28} />}
            onClick={() => router.push("/room/create")}
            fullWidth>
            {t("Menu.createRoom")}
          </ActionButton>
        </div>
      </div>
    </MenuShell>
  );
}
