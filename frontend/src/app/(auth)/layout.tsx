"use client";
import { ModalProvider } from "@/components/Modal/ModalContext";
import { SessionProvider } from "next-auth/react";

import type { Metadata } from "next";
import { SocketProvider } from "@/contexts/socket.context";

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
    <SessionProvider>
      <SocketProvider>
        <ModalProvider>
          <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen">
            {children}
          </div>
        </ModalProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
