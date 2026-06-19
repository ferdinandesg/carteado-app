"use client";
import { signOut } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";

import styles from "@/styles/Menu.module.scss";
import classNames from "classnames";
import { SocketProvider } from "@/contexts/socket.context";
import { useTranslation } from "react-i18next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const logout = () => signOut({ callbackUrl: "/" });
  return (
    <div className={classNames(styles.RootLayout, "app-background")}>
      <SocketProvider>
        {children}
        <button
          className={styles.logout}
          onClick={logout}>
          {t("logout")}
        </button>
      </SocketProvider>
    </div>
  );
}
