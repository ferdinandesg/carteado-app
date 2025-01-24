import Modal from "..";
import usePostRoom from "@/hooks/rooms/usePostRoom";

import { ArrowLeftCircle, ArrowRightCircle, Check } from "lucide-react";

import styles from "@styles/ModalCreateRoom.module.scss";
import classNames from "classnames";
import { useState } from "react";
import BackButton from "@/components/buttons/BackButton";

type RoomForm = {
  name: string;
  size: number;
};

interface ModalCreateRoomProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: (roomHash: string) => void;
}

const players = [2, 3, 4];

export default function ModalCreateRoom({
  isOpen,
  onClose = () => {},
  onConfirm = () => {},
}: ModalCreateRoomProps) {
  const [roomPayload, setRoomPayload] = useState<RoomForm>({
    name: "",
    size: 2,
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
      const room = await createRoom(roomPayload);
      onConfirm(room.hash);
    } catch (error) {
      console.error(error);
    }
  };
  if (!isOpen) return;

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
            placeholder="Nome da sala"
            className={styles.input}
            onChange={(e) => handleUpdateRoomPayload("name")(e.target.value)}
          />
        </div>
        <div className={styles.playersForm}>
          {players.map((player) => (
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
        <button
          disabled={!isFormValid}
          className={styles.createButton}
          onClick={handleCreateRoom}>
          <span>Criar sala</span>
          <ArrowRightCircle size={24} />
        </button>
      </Modal.Content>
    </Modal.Root>
  );
}
