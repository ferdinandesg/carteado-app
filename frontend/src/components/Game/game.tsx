import { useRoomContext } from "@/contexts/room.context";
import CarteadoGame from "./carteado.game";
import TrucoGame from "./truco.game";

export default function Game() {
  const { room, isLoading } = useRoomContext();
  if (isLoading || !room) return;

  if (room.rule === "CarteadoGameRules") {
    return <CarteadoGame />;
  }

  if (room.rule === "TrucoGameRules") {
    return <TrucoGame />;
  }

  return null;
}
