"use client";
import { Card } from "@/models/Cards";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import useGameState from "@/hooks/useGameState";
import { useParams } from "next/navigation";
import { Player } from "@/models/Users";
import { GameState } from "@/@types/game";

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
  player?: Player,
  rotatedPlayers: Player[]
}

const GameContext = createContext<GameContextProps | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { data } = useSession();
  const { game, updateGame } = useGameState(String(id));

  const players = game?.players || [];
  const player = players.find((p) => p.userId === data?.user.id);
  const currentPlayerIndex = game?.players.findIndex((p) => p.userId === data?.user.id);
  const rotatedPlayers = [
    ...players.slice(currentPlayerIndex),
    ...players.slice(0, currentPlayerIndex),
  ];
  console.log({
    game,
    data
  })
  const { socket } = useSocket();
  const [turn, setTurn] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isPlaying, setPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !socket) return;
    socket.on('game_update', (updatedGame: GameState) => {
      console.log({
        updatedGame
      })
      updateGame({
        ...updatedGame,
      })
    });

    return () => {
      socket.off("game_update");
    };
  }, [id, socket]);

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
        rotatedPlayers,
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
