import { useForm } from "react-hook-form";
import Modal from "..";
import usePostRoom from "@/hooks/rooms/usePostRoom";

import styles from "@styles/ModalCreateRoom.module.scss"
import { Check } from "lucide-react";
import { RoomInterface } from "@/models/room";

type RoomForm = {
  name: string;
  size: number;
};

interface ModalCreateRoomProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: (roomHash: string) => void;
}

export default function ModalCreateRoom({
  isOpen,
  onClose = () => { },
  onConfirm = () => { }
}: ModalCreateRoomProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomForm>();
  const { createRoom } = usePostRoom();

  const handleCreateRoom = handleSubmit(async (data) => {
    try {
      const room = await createRoom({ name: data.name, size: data.size });
      onConfirm(room.hash)
    } catch (error) {
      console.error(error);
    }
  });
  if (!isOpen) return
  return (
    <Modal.Root className="w-1/4 h-auto">
      <Modal.Header
        onClose={() => onClose()}
        title="Criar nova sala"
      ></Modal.Header>
      <Modal.Content className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="username" className="text-gray-600 text-sm">
              Nome da sala
            </label>
            <input
              {...register("name", { required: true })}
              type="text"
              id="username"
              className="p-1 border-b border-b-gray-400 transition focus:outline-none focus:border-b-gray-700"
            />
            {errors.name && (
              <span className="text-red-400 text-xs mt-2">
                Nome da sala deve ser informado
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="size" className="text-gray-600 text-sm">
              Jogadores
            </label>
            <input
              {...register("size", { required: true, max: 4, min: 2 })}
              type="number"
              maxLength={4}
              id="size"
              className="p-1 border-b border-b-gray-400 transition focus:outline-none focus:border-b-gray-700"
            />
            {errors.size && (
              <span className="text-red-400 text-xs mt-2">
                Quantidade de jogadores deve ser informado
              </span>
            )}
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.Buttons
          className="bg-green-600"
          onClick={() => handleCreateRoom()}
          icon={<Check color="white" />}
        >
          Confirmar
        </Modal.Buttons>{" "}
      </Modal.Footer>
    </Modal.Root>
  )
}