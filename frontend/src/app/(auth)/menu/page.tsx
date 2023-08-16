"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import useModalContext from "@/components/Modal/ModalContext";
import Modal from "@/components/Modal";
import { Check } from "lucide-react";
type RoomForm = {
  name: string;
  size: number;
};
export default function Menu() {
  const router = useRouter();
  const { data } = useSession();
  const { show, setShowModal } = useModalContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomForm>();
  const user = data?.user;
  const createRoom = handleSubmit(async (data) => {
    try {
      const response = await fetch("http://localhost:3001/api/rooms", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ name: data.name, createdBy: user?.name, size: data.size }),
      });
      const room = await response.json();
      router.push(`/room/${room.hash}`);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <>
      {show && (
        <Modal.Root>
          <Modal.Header
            onClose={() => setShowModal(false)}
            title="Criar nova sala"
          ></Modal.Header>
          <Modal.Content>
            <div className="flex flex-col w-1/4">
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
              <label htmlFor="username" className="text-gray-600 text-sm">
                Jogadores
              </label>
              <input
                {...register("size", { required: true, max: 4, min: 2 })}
                type="number"
                maxLength={4}
                id="username"
                className="p-1 border-b border-b-gray-400 transition focus:outline-none focus:border-b-gray-700"
              />
              {errors.size && (
                <span className="text-red-400 text-xs mt-2">
                  Quantidade de jogadores deve ser informado
                </span>
              )}
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Modal.Buttons
              className="bg-green-600"
              onClick={() => createRoom()}
              icon={<Check color="white" />}
            >
              Confirmar
            </Modal.Buttons>{" "}
          </Modal.Footer>
        </Modal.Root>
      )}
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col h-full justify-center w-1/2 gap-2 bg-black bg-opacity-20 p-2">
          <button
            className="p-2 bg-gray-400 hover:bg-gray-500 "
            onClick={() => setShowModal(true)}
          >
            Start game
          </button>
      
          <button onClick={() => router.push(`/rooms`)} className="p-2 bg-gray-400 hover:bg-gray-500 ">
            Join game
          </button>
        </div>
      </div>
    </>
  );
}
