"use client";

import { HtmlHTMLAttributes } from "react";
import classNames from "classnames";

import styles from "./Modal.module.scss";

export default function Content({
  className,
  ...props
}: HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(styles.modalContent, className)}
      {...props}
    />
  );
}
