"use client";

import { HtmlHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

import styles from "./Modal.module.scss";

interface ModalRootProps extends HtmlHTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Root({
  children,
  className,
  ...props
}: ModalRootProps) {
  return (
    <div
      className={styles.modalRoot}
      role="dialog"
      aria-modal>
      <div
        className={classNames(styles.modalPanel, className)}
        {...props}>
        {children}
      </div>
    </div>
  );
}
