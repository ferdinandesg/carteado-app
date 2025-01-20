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
      <GameProvider>
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen">
          {children}
        </div>
      </GameProvider>
    </RoomProvider>
  );
}
