import useRoomByHash from "@//hooks/rooms/useRoomByHash";
import CarteadoGame from "./carteado.game";
import TrucoGame from "./truco.game";

export default function Game({ roomHash }: { roomHash: string }) {
  const { room, isLoading } = useRoomByHash(roomHash);
  if (isLoading || !room) return;

  if (room.rule === "CarteadoGameRules") {
    return (
      <CarteadoGame />
    )
  }

  if (room.rule === "TrucoGameRules") {
    return (
      <TrucoGame />
    )
  }

  return null
}