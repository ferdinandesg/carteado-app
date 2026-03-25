"use client";

import styles from "@/styles/Separator.module.scss";

export default function Separator({ text }: { text: string }) {
  return (
    <div
      className={styles.separator}
      role="separator"
      aria-label={text}>
      <div
        className={styles.line}
        aria-hidden
      />
      <span className={styles.text}>{text}</span>
      <div
        className={styles.line}
        aria-hidden
      />
    </div>
  );
}
