"use client";
import { GameProvider } from "@/contexts/game.context";
import { RoomProvider } from "@/contexts/room.context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoomProvider>
      <GameProvider>{children}</GameProvider>
    </RoomProvider>
  );
}
