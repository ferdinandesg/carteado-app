"use client";

import { HtmlHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

import styles from "./Modal.module.scss";

interface FooterProps extends HtmlHTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  onConfirm?: () => void;
  children: ReactNode;
}

export default function Footer({ className, children, ...props }: FooterProps) {
  return (
    <footer
      className={classNames(styles.modalFooter, className)}
      {...props}>
      {children}
    </footer>
  );
}
