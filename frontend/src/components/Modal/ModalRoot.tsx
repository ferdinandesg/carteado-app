"use client";
import { HtmlHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ModalRootProps extends HtmlHTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
export default function Root({ children, ...props }: ModalRootProps) {
  return (
    <div className="absolute z-50 bg-black w-screen bg-opacity-75 h-screen flex justify-center items-center">
      <div
        className={twMerge(
          "w-1/2 h-1/2 flex flex-col justify-between",
          props.className
        )}
      >
        {children}
      </div>
    </div>
  );
}
