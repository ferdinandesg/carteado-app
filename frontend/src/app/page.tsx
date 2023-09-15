"use client";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Modal from "@/components/Modal";
import { Check } from "lucide-react";
import useModalContext from "@/components/Modal/ModalContext";
import { useSocket } from "@/contexts/socket.context";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
};

export default function Home() {
  const { setShowModal, show } = useModalContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const router = useRouter();
  const submit = handleSubmit((data) => {
    // authGuest(data.name);
    router.push("/menu");
  });
  return (
    <>
      {show && (
        <Modal.Root className="w-1/4">
          <Modal.Header
            onClose={() => setShowModal(false)}
            title="Entrar em uma sala"
          ></Modal.Header>
          <Modal.Content>
            <div className="mx-auto flex flex-col gap-4 w-full justify-center items-center p-2">
              <div className="flex flex-col">
                <label htmlFor="username" className="text-gray-600 text-sm">
                  Nome de usuário
                </label>
                <input
                  {...register("name", { required: true })}
                  type="text"
                  id="username"
                  className="p-1 border-b border-b-gray-400 transition focus:outline-none focus:border-b-gray-700"
                />
                {errors.name && (
                  <span className="text-red-400 text-xs mt-2">
                    Nome do convidado deve ser informado
                  </span>
                )}
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Modal.Buttons
              className="bg-green-600"
              onClick={() => submit()}
              icon={<Check color="white" />}
            >
              Confirmar
            </Modal.Buttons>
          </Modal.Footer>
        </Modal.Root>
      )}

      <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen flex items-center justify-center">
        <div className="w-1/2 h-1/2 bg-gray- 00 flex flex-col p-2 justify-around items-center bg-black bg-opacity-20">
          <h1 className="font-bold text-4xl">Carteado</h1>
          <div className="flex gap-2">
            <button
              className="bg-white p-2 rounded hover:bg-gray-200"
              onClick={() => signIn("google")}
            >
              Continuar com o Google
            </button>
            <button
              disabled
              onClick={() => setShowModal(true)}
              className="bg-gray-500 text-white hover:bg-gray-500 transition p-2 rounded"
            >
              Entrar como convidado
            </button>
          </div>
          <span className="text-gray-300 text-sm cursor-pointer hover:underline">
            Ver regras
          </span>
        </div>
      </div>
    </>
  );
}
