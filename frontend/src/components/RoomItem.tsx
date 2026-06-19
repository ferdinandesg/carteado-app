import { RoomInterface, RoomStatus } from "@/models/room";
import classNames from "classnames";

import styles from "@/styles/Rooms.module.scss";
import Image from "next/image";
import { useTranslation } from "react-i18next";

type RoomItemProps = {
  room: RoomInterface;
  onClick?: (room: RoomInterface) => void;
  isSelected?: boolean;
};

const RoomStatusBadge = ({ status }: { status: RoomStatus }) => {
  const { t } = useTranslation();

  return (
    <span
      data-testid={`room-status-${status}`}
      className={classNames(styles.roomStatus, styles[status])}
      aria-label={t(`RoomItem.${status}`)}
    />
  );
};

const RoomItem = ({
  room,
  isSelected = false,
  onClick = () => {},
}: RoomItemProps) => {
  const { t } = useTranslation();
  const participants = room.participants ?? [];
  const fallbackAvatar = room.owner?.image || "/assets/avatars/avatar1.png";
  const visibleParticipants =
    participants.length > 0
      ? participants.slice(0, 4)
      : [{ name: room.owner?.name || room.name, image: fallbackAvatar }];

  const status = room.status ?? "open";
  const rule = room.rule ?? "CarteadoGameRules";
  const roomSize = room.size ?? participants.length;
  const playersCount = `${participants.length}/${roomSize}`;

  return (
    <button
      type="button"
      data-testid={`room-item-${room.id}`}
      onClick={() => onClick(room)}
      className={classNames(styles.RoomItem, {
        [styles.selectedRoom]: isSelected,
      })}
      aria-pressed={isSelected}
      key={room.id}>
      <div
        className={styles.participantStack}
        aria-label={t("RoomItem.participants")}>
        {visibleParticipants.map((participant, index) => (
          <Image
            key={`${participant.name}-${index}`}
            className={styles.participantAvatar}
            alt={participant.name}
            src={participant.image || "/assets/avatars/avatar1.png"}
            width={58}
            height={58}
          />
        ))}
      </div>

      <div className={styles.roomData}>
        <div className={styles.infoCount}>
          <span className={styles.label}>{t("RoomItem.rule")}</span>
          <strong className={styles.count}>{t(`RoomItem.${rule}`)}</strong>
        </div>
        <div className={styles.infoCount}>
          <span className={styles.label}>{t("RoomItem.players")}</span>
          <strong className={styles.count}>{playersCount}</strong>
        </div>

        <div className={styles.roomInfo}>
          <span className={styles.roomName}>{room.name}</span>
          <span className={styles.roomHash}>#{room.hash.toUpperCase()}</span>
        </div>
      </div>

      <RoomStatusBadge status={status} />
    </button>
  );
};

export default RoomItem;
