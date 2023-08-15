"use client";
import { ModalProvider } from "@/components/Modal/ModalContext";
import { SessionProvider } from "next-auth/react";

import type { Metadata } from "next";
import { SocketProvider } from "@/contexts/socket.context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Carteado App",
  description: "Jogasso",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen">
      {children}
    </div>
  );
}
