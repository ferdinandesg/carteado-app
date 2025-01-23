"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useModalContext from "@/components/Modal/ModalContext";
import ModalCreateRoom from "@/components/Modal/ModalCreateRoom/ModalCreateRoom";

import styles from "@styles/Menu.module.scss";
import UserCard from "@/components/UserCard";
import { List, ListPlus, Play } from "lucide-react";
import classNames from "classnames";
import { Pixelify_Sans } from "next/font/google";
import { ButtonHTMLAttributes, HtmlHTMLAttributes } from "react";

type MenuButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
};
const pixelify = Pixelify_Sans({ weight: ["700", "700"], subsets: ["latin"] });

const MenuButton = ({
  onClick,
  icon,
  label,
  ...props
}: MenuButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={styles.MenuButton}
      onClick={onClick}
      {...props}>
      <div className={styles.menuIcon}>{icon}</div>
      <span className={styles.menuLabel}>{label}</span>
    </button>
  );
};

export default function Menu() {
  const router = useRouter();
  const { data } = useSession();
  const { show, setShowModal } = useModalContext();

  const onCreateRoom = (hash: string) => {
    router.push(`/room/${hash}`);
  };

  return (
    <>
      <ModalCreateRoom
        isOpen={show}
        onClose={() => setShowModal(false)}
        onConfirm={onCreateRoom}
      />
      <div className={classNames(styles.Menu, "square-bg")}>
        <div className={styles.menuContent}>
          <UserCard user={data?.user} />
          <div className={styles.menuActions}>
            <MenuButton
              label="Jogar"
              disabled
              icon={<Play size={42} />}
              onClick={() => router.push(`/rooms`)}
            />
            <MenuButton
              label="Criar sala"
              icon={<ListPlus size={42} />}
              onClick={() => setShowModal(true)}
            />
            <MenuButton
              label="Salas criadas"
              icon={<List size={42} />}
              onClick={() => router.push(`/rooms`)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
