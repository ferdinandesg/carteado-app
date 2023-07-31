'use client'
import { ReactNode } from "react";

interface ModalRootProps {
  children: ReactNode;
}
export default function Root({ children }: ModalRootProps) {
  return (
    <div className="absolute z-50 bg-black w-screen bg-opacity-75 h-screen flex justify-center items-center">
      <div className="w-1/2 h-1/2 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
