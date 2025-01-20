"use client";
import { Card } from "@/models/Cards";
import {
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import useGameState from "@/hooks/useGameState";
import { useParams } from "next/navigation";
import { Player } from "@/models/Users";

interface GameContextProps {
  isPlaying: boolean;
  isLoading: boolean;
  tableCards: Card[];
  handCards: Card[];
  bunchCards: Card[];
  turn: string | undefined;
  retrieveCard: (card: Card) => void;
  endTurn: () => void;
  drawTable: () => void;
  handlePickCards: (cards: Card[]) => void;
  player?: Player
}

const GameContext = createContext<GameContextProps | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { data } = useSession();
  const { game } = useGameState(String(id));

  const player = game?.players.find((p) => p.email === data?.user?.email);

  const { socket } = useSocket();
  const [turn, setTurn] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isPlaying, setPlaying] = useState<boolean>(false); 

  const handlePickCards = (cards: Card[]) => {
    socket?.emit("pick_hand", { cards });
  };

  const retrieveCard = (card: Card) => {
    socket?.emit("retrieve_card", { card })
  };

  const endTurn = () => {
    socket?.emit("end_turn");
  };

  const drawTable = () => {
    socket?.emit("draw_table");
  };

  const gameTable = game?.cards;
  return (
    <GameContext.Provider
      value={{
        player,
        handCards: player?.hand || [],
        tableCards: player?.table || [],
        bunchCards: gameTable?.cards || [],
        isLoading,
        isPlaying,
        turn,
        endTurn,
        drawTable,
        retrieveCard,
        handlePickCards,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGameContext must be used within a GameContextProvider");
  return context;
}
