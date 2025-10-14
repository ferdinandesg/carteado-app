"use client";
import { signOut } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";

import styles from "@styles/Menu.module.scss";
import { Pixelify_Sans } from "next/font/google";
import classNames from "classnames";
import { SocketProvider } from "@/contexts/socket.context";
import { useTranslation } from "react-i18next";

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation()
  const logout = () => signOut({ callbackUrl: "/" });
  return (
    <div
      className={classNames(
        styles.RootLayout,
        "square-bg",
        pixelify.className
      )}>
      <SocketProvider>
        {children}
        <button className={styles.logout} onClick={logout}>{t("logout")}</button>
      </SocketProvider>
    </div>
  );
}
