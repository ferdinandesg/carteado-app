"use client";

import { X } from "lucide-react";
import { HtmlHTMLAttributes } from "react";

import styles from "./Modal.module.scss";

interface HeaderProps extends HtmlHTMLAttributes<HTMLDivElement> {
  title: string;
  onClose?: () => void;
}

export default function Header({ title, onClose, ...props }: HeaderProps) {
  return (
    <header
      className={styles.modalHeader}
      {...props}>
      <h2 className={styles.modalHeaderTitle}>{title}</h2>
      {onClose && (
        <button
          type="button"
          className={styles.modalCloseButton}
          onClick={onClose}
          aria-label="Fechar">
          <X />
        </button>
      )}
    </header>
  );
}
