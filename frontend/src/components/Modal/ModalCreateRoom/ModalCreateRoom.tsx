import Modal from "..";
import usePostRoom from "@/hooks/rooms/usePostRoom";

import { ArrowRightCircle } from "lucide-react";

import styles from "@styles/ModalCreateRoom.module.scss";
import classNames from "classnames";
import { useState } from "react";
import BackButton from "@/components/buttons/BackButton";
import { withSound } from "@/components/buttons/withSound";
import { useTranslation } from "react-i18next";

type RoomForm = {
  name: string;
  size: number;
  rule: "CarteadoGameRules" | "TrucoGameRules";
};

interface ModalCreateRoomProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: (roomHash: string) => void;
}

const players = {
  carteado: [2, 3, 4],
  truco: [2, 4],
};

const CreateRoomButton = withSound(
  ({ onClick, disabled, text }: { onClick: () => void; disabled: boolean, text: string }) => {
    return (
      <button
        className={styles.createButton}
        onClick={onClick}
        disabled={disabled}>
        <span>{text}</span>
        <ArrowRightCircle size={24} />
      </button>
    );
  },
  {
    clickSrc: "/assets/sfx/button-click.mp3",
  }
);

export default function ModalCreateRoom({
  isOpen,
  onClose = () => { },
  onConfirm = () => { },
}: ModalCreateRoomProps) {
  const { t } = useTranslation()
  const [roomPayload, setRoomPayload] = useState<RoomForm>({
    name: "",
    size: 2,
    rule: "CarteadoGameRules",
  });
  const { createRoom } = usePostRoom();
  const isFormValid = roomPayload.name.length > 0;

  const handleUpdateRoomPayload =
    (key: keyof RoomForm) => (value: string | number) => {
      setRoomPayload((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleCreateRoom = async () => {
    try {
      const {
        rule,
        size,
      } = roomPayload;
      if (rule === "TrucoGameRules" && size === 3) return
      const room = await createRoom(roomPayload);
      onConfirm(room.hash);
    } catch (error) {
      console.error(error);
    }
  };
  if (!isOpen) return;

  const roomSize = roomPayload.rule === "CarteadoGameRules" ? players.carteado : players.truco
  return (
    <Modal.Root className={styles.ModalRoot}>
      <Modal.Content className={styles.ModalContent}>
        <BackButton
          color="dark"
          onClick={onClose}
          size={24}
        />
        <div className={styles.inputForm}>
          <input
            type="text"
            id="username"
            placeholder={t("CreateRoom.roomName")}
            className={styles.input}
            onChange={(e) => handleUpdateRoomPayload("name")(e.target.value)}
          />
        </div>
        <div className={styles.playersForm}>
          {roomSize.map((player) => (
            <button
              onClick={(e) =>
                handleUpdateRoomPayload("size")(+e.currentTarget.value)
              }
              value={player}
              key={`room-size-${player}`}
              className={classNames(
                roomPayload.size === player && styles.selected
              )}>
              {player}
            </button>
          ))}
        </div>
        <div className={styles.playersForm}>
          <button
            onClick={(e) =>
              handleUpdateRoomPayload("rule")(e.currentTarget.value)
            }
            value="CarteadoGameRules"
            key={`room-rule-CarteadoGameRules`}
            className={classNames(
              roomPayload.rule === "CarteadoGameRules" && styles.selected
            )}>
            Carteado
          </button>
          <button
            onClick={(e) =>
              handleUpdateRoomPayload("rule")(e.currentTarget.value)
            }
            value="TrucoGameRules"
            key={`room-rule-TrucoGameRules`}
            className={classNames(
              roomPayload.rule === "TrucoGameRules" && styles.selected
            )}>
            Truco
          </button>
        </div>

        <CreateRoomButton
          text={t("CreateRoom.create")}
          onClick={handleCreateRoom}
          disabled={!isFormValid}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
