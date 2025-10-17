"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import styles from "@/styles/Menu.module.scss";
import UserCard from "@//components/UserCard";
import { List, ListPlus, Play } from "lucide-react";
import classNames from "classnames";
import MenuButton from "@//components/buttons/MenuButton";
import { useTranslation } from "react-i18next";
import useTitle from "@//hooks/useTitle";

export default function Menu() {
  const { t } = useTranslation()
  useTitle({ title: t("pageTitles.menu") });

  const router = useRouter();
  const { data } = useSession();
  return (
    <>
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
              onClick={() => router.push(`/room/create`)}
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
