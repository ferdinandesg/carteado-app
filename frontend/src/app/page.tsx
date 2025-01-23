"use client";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Modal from "@/components/Modal";
import { Check } from "lucide-react";
import useModalContext from "@/components/Modal/ModalContext";
import { useRouter } from "next/navigation";

import styles from "@styles/Home.module.scss";
import classNames from "classnames";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";

const pixelify = Pixelify_Sans({
  weight: ["400"],
  subsets: ["latin"],
});
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
  const submit = handleSubmit(() => {
    router.push("/menu");
  });
  return (
    <>
      {show && (
        <Modal.Root className="w-1/4">
          <Modal.Header
            onClose={() => setShowModal(false)}
            title="Entrar em uma sala"></Modal.Header>
          <Modal.Content>
            <div className="mx-auto flex flex-col gap-4 w-full justify-center items-center p-2">
              <div className="flex flex-col">
                <label
                  htmlFor="username"
                  className="text-gray-600 text-sm">
                  Nome de usuário
                </label>
                <input
                  {...register("name", { required: true })}
                  type="text"
                  id="username"
                  className=" bg-opacity-0 p-1 border-b border-b-gray-400 transition focus:outline-none focus:border-b-gray-700"
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
              icon={<Check color="white" />}>
              Confirmar
            </Modal.Buttons>
          </Modal.Footer>
        </Modal.Root>
      )}

      <div className={classNames(styles.Home, "square-bg", pixelify.className)}>
        <div className={styles.container}>
          <h1 className={styles.title}>Carteado</h1>
          <div className={styles.authMethods}>
            <button
              className={styles.google}
              onClick={() => signIn("google")}>
              <Image
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google Logo"
                width={25}
                height={25}
              />
              Continuar com o Google
            </button>
            <button
              disabled
              onClick={() => setShowModal(true)}
              className="bg-gray-500 text-white hover:bg-gray-500 transition p-2 rounded">
              Entrar como convidado
            </button>
          </div>
          <span className={styles.rulesButton}>Ver regras</span>
        </div>
      </div>
    </>
  );
}
