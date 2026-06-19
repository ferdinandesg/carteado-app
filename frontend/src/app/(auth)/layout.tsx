"use client";
import "react-toastify/dist/ReactToastify.css";

import styles from "@/styles/Menu.module.scss";
import classNames from "classnames";
import { SocketProvider } from "@/contexts/socket.context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={classNames(styles.RootLayout, "app-background")}>
      <SocketProvider>{children}</SocketProvider>
    </div>
  );
}
