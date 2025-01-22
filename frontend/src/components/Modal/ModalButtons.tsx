import { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}
export default function Buttons({ icon: Icon, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        "p-2 rounded-sm transition",
        props.className,
        props.disabled ? "opacity-50" : "opacity-100"
      )}>
      {Icon}
    </button>
  );
}
