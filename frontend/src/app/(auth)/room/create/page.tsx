"use client";
import BackButton from "@/components/buttons/BackButton";
import ActionButton from "@/components/buttons/ActionButton";
import TextInput from "@/components/inputs/TextInput";
import MenuShell from "@/components/menu/MenuShell";
import usePostRoom from "@/hooks/rooms/usePostRoom";
import { ArrowRightCircle, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/CreateRoom.module.scss";
import { useRouter } from "next/navigation";
import logger from "@/lib/logger";
import useTitle from "@/hooks/useTitle";

type RoomForm = {
  name: string;
  size: number;
  rule: "CarteadoGameRules" | "TrucoGameRules";
};

const players = {
  carteado: [2, 3, 4],
  truco: [2, 4],
};

export default function CreateRoom() {
  const { t } = useTranslation();
  useTitle({ title: t("CreateRoom.createRoom") });

  const router = useRouter();

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
        ...(key === "rule" && value === "TrucoGameRules" && prev.size === 3
          ? { size: 2 }
          : {}),
      }));
    };

  const handleCreateRoom = async () => {
    try {
      const { rule, size } = roomPayload;
      if (rule === "TrucoGameRules" && size === 3) return;
      const room = await createRoom(roomPayload);
      router.push(`/room/${room.hash}`);
    } catch (error) {
      logger.error(error);
    }
  };

  const roomSize =
    roomPayload.rule === "CarteadoGameRules" ? players.carteado : players.truco;

  return (
    <MenuShell
      activeTabLabel={t("CreateRoom.createRoom")}
      contentSize="default">
      <div className={styles.createRoomContent}>
        <BackButton
          data-testid="back-button"
          color="white"
          onClick={() => window.history.back()}
          size={24}
        />
        <form
          className={styles.formContent}
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateRoom();
          }}>
          <label className={styles.fieldGroup}>
            <span>{t("CreateRoom.roomName")}</span>
            <TextInput
              type="text"
              data-testid="room-name-input"
              id="room-name"
              placeholder={t("CreateRoom.roomName")}
              inputSize="lg"
              value={roomPayload.name}
              onChange={(event) =>
                handleUpdateRoomPayload("name")(event.target.value)
              }
            />
          </label>

          <fieldset className={styles.fieldGroup}>
            <legend>{t("RoomItem.rule")}</legend>
            <div className={styles.optionGroup}>
              {(["CarteadoGameRules", "TrucoGameRules"] as const).map(
                (rule) => (
                  <button
                    type="button"
                    data-testid={`room-rule-button-${rule}`}
                    onClick={() => handleUpdateRoomPayload("rule")(rule)}
                    value={rule}
                    key={`room-rule-${rule}`}
                    className={
                      roomPayload.rule === rule ? styles.selected : undefined
                    }>
                    {t(`RoomItem.${rule}`)}
                  </button>
                )
              )}
            </div>
          </fieldset>

          <fieldset className={styles.fieldGroup}>
            <legend>{t("CreateRoom.maxPlayers")}</legend>
            <div className={styles.optionGroup}>
              {roomSize.map((player) => (
                <button
                  type="button"
                  data-testid={`room-size-button-${player}`}
                  onClick={() => handleUpdateRoomPayload("size")(player)}
                  value={player}
                  key={`room-size-${player}`}
                  className={
                    roomPayload.size === player ? styles.selected : undefined
                  }>
                  <Users
                    size={20}
                    aria-hidden
                  />
                  {player}
                </button>
              ))}
            </div>
          </fieldset>

          <ActionButton
            type="submit"
            className={styles.createButton}
            disabled={!isFormValid}
            icon={<ArrowRightCircle size={24} />}
            iconPosition="right"
            data-testid="create-room-button">
            {t("CreateRoom.create")}
          </ActionButton>
        </form>
      </div>
    </MenuShell>
  );
}
