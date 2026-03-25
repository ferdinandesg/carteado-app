"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

import styles from "./Modal.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export default function Buttons({
  icon: Icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(styles.modalButton, className)}
      disabled={disabled}
      {...props}>
      {Icon}
    </button>
  );
}
