"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useModalContext from "@/components/Modal/ModalContext";
import ModalCreateRoom from "@/components/Modal/ModalCreateRoom/ModalCreateRoom";

import styles from "@styles/Menu.module.scss";
import UserCard from "@/components/UserCard";
import { List, ListPlus, Play } from "lucide-react";
import classNames from "classnames";
import MenuButton from "@/components/buttons/MenuButton";
import { useTranslation } from "react-i18next";

export default function Menu() {
  const { t } = useTranslation()

  const router = useRouter();
  const { data } = useSession();
  const { show, setShowModal } = useModalContext();

  const onCreateRoom = function (hash: string) {
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
              label={t("Menu.play")}
              disabled
              icon={<Play size={42} />}
              onClick={() => router.push(`/rooms`)}
            />
            <MenuButton
              label={t("Menu.createRoom")}
              icon={<ListPlus size={42} />}
              onClick={() => setShowModal(true)}
            />
            <MenuButton
              label={t("Menu.createdRooms")}
              icon={<List size={42} />}
              onClick={() => router.push(`/rooms`)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
