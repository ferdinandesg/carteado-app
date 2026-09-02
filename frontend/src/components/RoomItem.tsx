import classNames from "classnames";
import { Users } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { RoomInterface, RoomStatus } from "shared/types";

import styles from "@/styles/Rooms.module.scss";

type RoomItemProps = {
  room: RoomInterface;
  onClick?: (room: RoomInterface) => void;
  isSelected?: boolean;
};

const MAX_AVATARS = 3;
const FALLBACK_AVATAR = "/assets/avatars/avatar1.png";

const RoomStatusBadge = ({ status }: { status: RoomStatus }) => {
  const { t } = useTranslation();

  return (
    <span
      data-testid={`room-status-${status}`}
      className={classNames(styles.roomStatus, styles[status])}
      aria-label={t(`RoomItem.${status}`)}
      title={t(`RoomItem.${status}`)}
    />
  );
};

/** Linha compacta, mesmo padrão do item de participante (faixa + avatar + meta + contagem). */
const RoomItem = ({
  room,
  isSelected = false,
  onClick = () => {},
}: RoomItemProps) => {
  const { t } = useTranslation();
  const participants = room.participants ?? [];
  const status = room.status ?? "open";
  const rule = room.rule ?? "CarteadoGameRules";
  const roomSize = room.size ?? participants.length;

  const avatars =
    participants.length > 0
      ? participants.slice(0, MAX_AVATARS).map((p) => ({
          name: p.name,
          image: p.image || FALLBACK_AVATAR,
        }))
      : [
          {
            name: room.owner?.name || room.name,
            image: room.owner?.image || FALLBACK_AVATAR,
          },
        ];
  const hiddenCount = Math.max(participants.length - MAX_AVATARS, 0);

  return (
    <button
      type="button"
      data-testid={`room-item-${room.id}`}
      onClick={() => onClick(room)}
      className={classNames(styles.RoomItem, styles[status], {
        [styles.selectedRoom]: isSelected,
      })}
      aria-pressed={isSelected}>
      <div
        className={styles.participantStack}
        aria-label={t("RoomItem.participants")}>
        {avatars.map((participant, index) => (
          <Image
            key={`${participant.name}-${index}`}
            className={styles.participantAvatar}
            alt={participant.name}
            src={participant.image}
            width={40}
            height={40}
          />
        ))}
        {hiddenCount > 0 && (
          <span className={classNames(styles.participantAvatar, styles.more)}>
            +{hiddenCount}
          </span>
        )}
      </div>

      <div className={styles.roomMeta}>
        <span
          className={styles.roomName}
          title={room.name}>
          {room.name}
        </span>
        <span className={styles.roomTags}>
          <span className={styles.ruleTag}>{t(`RoomItem.${rule}`)}</span>
          <span className={styles.roomHash}>#{room.hash.toUpperCase()}</span>
        </span>
      </div>

      <span
        className={styles.playersCount}
        aria-label={t("RoomItem.players")}>
        <Users
          size={14}
          aria-hidden
        />
        {participants.length}/{roomSize}
      </span>

      <RoomStatusBadge status={status} />
    </button>
  );
};

export default RoomItem;
