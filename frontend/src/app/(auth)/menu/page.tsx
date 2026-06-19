"use client";

import { useRouter } from "next/navigation";

import ActionButton from "@/components/buttons/ActionButton";
import MenuShell from "@/components/menu/MenuShell";
import styles from "@/styles/Menu.module.scss";
import { List, ListPlus, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";

export default function Menu() {
  const { t } = useTranslation();
  useTitle({ title: t("pageTitles.menu") });

  const router = useRouter();

  return (
    <MenuShell activeTabLabel={t("Menu.gameplay")}>
      <div className={styles.menuActions}>
        <ActionButton
          type="button"
          className={styles.menuAction}
          variant="primary"
          size="lg"
          icon={<Play size={28} />}
          onClick={() => router.push(`/rooms`)}>
          {t("Menu.play")}
        </ActionButton>
        <ActionButton
          type="button"
          className={styles.menuAction}
          variant="secondary"
          size="lg"
          icon={<ListPlus size={28} />}
          onClick={() => router.push(`/room/create`)}>
          {t("Menu.createRoom")}
        </ActionButton>
        <ActionButton
          type="button"
          className={styles.menuAction}
          variant="accent"
          size="lg"
          icon={<List size={28} />}
          onClick={() => router.push(`/rooms`)}>
          {t("Menu.createdRooms")}
        </ActionButton>
      </div>
    </MenuShell>
  );
}
