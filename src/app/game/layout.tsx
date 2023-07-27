"use client";
import { ModalProvider } from "@/components/Modal/ModalContext";
import { GameProvider } from "@/contexts/game.context";
import type { Metadata } from "next";

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
    <ModalProvider>
      <GameProvider>
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen">
          {children}
        </div>
      </GameProvider>
    </ModalProvider>
  );
}
