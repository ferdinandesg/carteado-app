"use client";

import { CSSProperties, ReactNode } from "react";

import styles from "@/styles/Room.module.scss";

type RoomShellProps = {
  participants: ReactNode;
  info: ReactNode;
  children: ReactNode;
};

export default function RoomShell({
  participants,
  info,
  children,
}: RoomShellProps) {
  const shellStyle = {
    "--participants-column-width": "25%",
    "--main-column-width": "1fr",
    "--info-column-width": "25%",
  } as CSSProperties;

  return (
    <main
      className={styles.roomShell}
      style={shellStyle}>
      <div className={styles.roomSidePanel}>{participants}</div>
      <section className={styles.roomStage}>{children}</section>
      <div className={styles.roomSidePanel}>{info}</div>
    </main>
  );
}
