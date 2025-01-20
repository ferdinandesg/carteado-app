import { useContext, createContext, ReactNode, useState, useEffect } from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import { Card } from "@/models/Cards";
import { RoomInterface, RoomStatus } from "@/models/room";
import usePlayers from "../hooks/usePlayers";
import { Player } from "@/models/Users";
import { toast } from 'react-toastify'

type RoomContextProps = {
  name: string;
  turn: string;
  roomId: string;
  status: RoomStatus;
  actualPlayer: Player | undefined;
  players: Player[];
  bunch: Card[];
  initRoom: (room: RoomInterface) => void
  endTurn: () => void
  playCard: (card: Card) => void
  drawTable: () => void
  handlePickCards: (card: Card[]) => void
}
const RoomContext = createContext<RoomContextProps | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const { socket } = useSocket();
  const { players, setPlayers, handlePickCards, playCard, refreshPlayer } = usePlayers();
  const [roomId, setRoomId] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [status, setStatus] = useState<RoomStatus>("open");
  const [bunch, setBunch] = useState<Card[]>([]);
  const [turn, setTurn] = useState<string>("");

  const actualPlayer = players.find(x => x.user.id === data?.user.id);

  useEffect(() => {
    console.log({ playerChanged: actualPlayer });

  }, [actualPlayer])

  useEffect(() => {
    if (!socket) return;
    socket.on("refresh_room", payload => {
      const obj = JSON.parse(payload)

      refreshPlayer(obj.player)
      setBunch(obj.bunch)
      if (obj.turn) setTurn(obj.turn)
    })
    socket.on("player_turn", (id) => {
      setTurn(id)
      if (actualPlayer?.user.id === id) toast("É sua vez!")
    });
    socket.on("start_game", () => setStatus("playing"));
    socket.on("all_chosed", () => toast("Todos os jogadores selecionaram suas cartas"));

    return () => {
      socket.off("refresh_room")
      socket.off("player_turn")
    }
  }, [socket])

  function initRoom(room: RoomInterface) {
    console.log({ initRoom: room });

    setRoomId(room.hash)
    setName(room.name)
    setStatus(room.status)
    setBunch(room.bunch)
    setPlayers([...room.players])
  }
  function endTurn() {
    socket?.emit("end_turn");
  };

  function drawTable() {
    socket?.emit("draw_table");
  };

  return (
    <RoomContext.Provider value={{
      name,
      actualPlayer,
      status,
      roomId,
      players,
      bunch,
      turn,
      handlePickCards,
      initRoom,
      endTurn,
      drawTable,
      playCard
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context)
    throw new Error("useRoomContext must be used within a RoomContextProvider");
  return context;
}
