"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useModalContext from "@/components/Modal/ModalContext";
import ModalCreateRoom from "@/components/Modal/ModalCreateRoom/ModalCreateRoom";

import styles from "@styles/Menu.module.scss";
import UserCard from "@/components/UserCard";
import { List, ListPlus, Play } from "lucide-react";

type MenuButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
};
const MenuButton = ({ onClick, icon, label }: MenuButtonProps) => {
  return (
    <div
      className={styles.MenuButton}
      onClick={onClick}>
      <div className={styles.menuIcon}>{icon}</div>
      <span className={styles.menuLabel}>{label}</span>
    </div>
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
      <div className={styles.Menu}>
        <div className={styles.user}>
          <UserCard user={data?.user} />
        </div>
        <div className={styles.menuActions}>
          <MenuButton
            label="Jogar"
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
    </>
  );
}
