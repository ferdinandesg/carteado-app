"use client";

import { CSSProperties, ReactNode } from "react";

import styles from "@/styles/Room.module.scss";

type RoomShellProps = {
  chat: ReactNode;
  info: ReactNode;
  children: ReactNode;
  isChatCollapsed?: boolean;
  isInfoCollapsed?: boolean;
};

export default function RoomShell({
  chat,
  info,
  children,
  isChatCollapsed = false,
  isInfoCollapsed = false,
}: RoomShellProps) {
  const shellStyle = {
    "--chat-column-width": isChatCollapsed ? "44px" : "25%",
    "--main-column-width": "1fr",
    "--info-column-width": isInfoCollapsed ? "44px" : "25%",
  } as CSSProperties;

  return (
    <main
      className={styles.roomShell}
      style={shellStyle}>
      <div className={styles.roomSidePanel}>{chat}</div>
      <section className={styles.roomStage}>{children}</section>
      <div className={styles.roomSidePanel}>{info}</div>
    </main>
  );
}
