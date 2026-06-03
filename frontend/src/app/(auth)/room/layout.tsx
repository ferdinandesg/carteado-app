"use client";
import { GameController } from "@/contexts/game.controller";
import { RoomProvider } from "@/contexts/room.context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoomProvider>
      <GameController />
      {children}
    </RoomProvider>
  );
}
