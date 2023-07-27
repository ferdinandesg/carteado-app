import { HtmlHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface FooterProps extends HtmlHTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  onConfirm?: () => void;
  children: ReactNode;
}
export default function Footer({ ...props }: FooterProps) {
  return (
    <div
      className={twMerge(
        "h-16 flex bg-gray-300 p-2 justify-end items-center gap-3 rounded-b",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
